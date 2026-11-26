import type { Action } from "atoms";
import { autoNamedLine, includesText, shortestUniquePaths, type ValueKind, valueKind } from "lib/format";
import type { Section, TreeRow } from "./types";

interface Leaf {
	action: Action;
	label: string;
	atomIds: string[];
	merged: boolean;
}

interface Folder {
	name: string;
	folders: Map<string, Folder>;
	leaves: Leaf[];
	count: number;
	latest: number;
}

export interface TreeRowOptions {
	query: string;
	kinds: Readonly<Record<ValueKind, boolean>>;
	collapsed: ReadonlySet<string>;
	byRecent: boolean;
	/** Counterpart of atoms that exist on both environments, keyed by atom id; such atoms share a single row. */
	counterparts: ReadonlyMap<string, Action>;
}

const SECTIONS: readonly { id: Section; label: string }[] = [
	{ id: "client", label: "Client" },
	{ id: "server", label: "Server" },
	{ id: "shared", label: "Shared" },
];

const SHARED_ROOTS = ["ReplicatedStorage", "ReplicatedFirst"];

function rootOf(scriptPath: string) {
	const [dot] = scriptPath.find(".", 1, true);
	return dot !== undefined ? scriptPath.sub(1, dot - 1) : scriptPath;
}

/** Atoms created by modules that replicate to both environments belong to the shared section. */
export function sectionOf(action: Action): Section {
	const scriptPath = action.source?.script;
	if (scriptPath !== undefined && SHARED_ROOTS.includes(rootOf(scriptPath))) return "shared";
	return action.env;
}

function splitPath(scriptPath: string): string[] {
	const segments: string[] = [];
	for (const [segment] of scriptPath.gmatch("[^%.]+")) segments.push(segment as string);
	return segments;
}

function leafLabel(action: Action): string {
	const line = autoNamedLine(action);
	return line !== undefined ? `line ${line}` : action.name;
}

function createFolder(name: string): Folder {
	return { name, folders: new Map(), leaves: [], count: 0, latest: 0 };
}

function insert(root: Folder, path: readonly string[], leaf: Leaf) {
	let folder = root;
	const touch = (target: Folder) => {
		target.count += 1;
		target.latest = math.max(target.latest, leaf.action.timestamp);
	};

	touch(folder);
	for (const segment of path) {
		let child = folder.folders.get(segment);
		if (child === undefined) {
			child = createFolder(segment);
			folder.folders.set(segment, child);
		}
		folder = child;
		touch(folder);
	}
	folder.leaves.push(leaf);
}

/** Merges folders that only contain a single folder, e.g. `Players.Player1.PlayerScripts`; the merged name keeps every segment. */
function compact(folder: Folder): Folder {
	let current = folder;
	while (current.leaves.isEmpty() && current.folders.size() === 1) {
		let only: Folder | undefined;
		for (const [, child] of current.folders) only = child;
		if (only === undefined) break;
		current = { ...only, name: `${current.name}.${only.name}` };
	}
	return current;
}

export function buildTreeRows(actions: readonly Action[], options: TreeRowOptions): TreeRow[] {
	const { query, kinds, collapsed, byRecent, counterparts } = options;

	const sections = new Map<Section, Folder>();

	for (const action of actions) {
		const counterpart = counterparts.get(action.atomId);
		// the pair is listed once, under the client atom
		if (counterpart !== undefined && action.env === "server") continue;

		const members = counterpart !== undefined ? [action, counterpart] : [action];
		if (!members.some((member) => kinds[valueKind(member.value)])) continue;
		if (!includesText(action.name, query)) continue;

		const merged = counterpart !== undefined;
		const latest = merged && counterpart.timestamp > action.timestamp ? counterpart : action;

		const sectionId = merged ? "shared" : sectionOf(action);
		let section = sections.get(sectionId);
		if (section === undefined) {
			section = createFolder(sectionId);
			sections.set(sectionId, section);
		}

		const scriptPath = action.source?.script;
		insert(section, scriptPath !== undefined ? splitPath(scriptPath) : [], {
			action: latest,
			label: leafLabel(action),
			atomIds: members.map((member) => member.atomId),
			merged,
		});
	}

	const compareLeaves = (a: Leaf, b: Leaf) => {
		if (byRecent) return a.action.timestamp > b.action.timestamp;
		const left = a.label.lower();
		const right = b.label.lower();
		return left !== right ? left < right : a.action.env < b.action.env;
	};

	const result: TreeRow[] = [];
	const isOpen = (key: string) => query !== "" || !collapsed.has(key);

	const pushLeaf = (leaf: Leaf, depth: number, section: Section) => {
		result.push({
			kind: "atom",
			action: leaf.action,
			label: leaf.label,
			atomIds: leaf.atomIds,
			depth,
			env: leaf.merged ? "both" : section === "shared" ? leaf.action.env : undefined,
		});
	};

	const pushContents = (folder: Folder, key: string, depth: number, section: Section) => {
		const children: Folder[] = [];
		for (const [, child] of folder.folders) children.push(compact(child));

		const labels = shortestUniquePaths(children.map((child) => child.name));
		children.sort((a, b) => {
			if (byRecent) return a.latest > b.latest;
			const left = (labels.get(a.name) ?? a.name).lower();
			const right = (labels.get(b.name) ?? b.name).lower();
			return left !== right ? left < right : a.name.lower() < b.name.lower();
		});

		for (const child of children) {
			const name = labels.get(child.name) ?? child.name;

			// a script with a single atom is listed as the atom itself, e.g. `controller:44`
			const only = child.folders.isEmpty() && child.leaves.size() === 1 ? child.leaves[0] : undefined;
			if (only !== undefined) {
				const line = autoNamedLine(only.action);
				pushLeaf({ ...only, label: line !== undefined ? `${name}:${line}` : only.label }, depth, section);
				continue;
			}

			const childKey = `${key}.${child.name}`;
			const open = isOpen(childKey);
			result.push({
				kind: "group",
				key: childKey,
				name,
				count: child.count,
				open,
				depth,
			});
			if (open) pushContents(child, childKey, depth + 1, section);
		}

		folder.leaves.sort(compareLeaves);
		for (const leaf of folder.leaves) pushLeaf(leaf, depth, section);
	};

	for (const { id, label } of SECTIONS) {
		const section = sections.get(id);
		if (section === undefined) continue;

		const open = isOpen(id);
		result.push({ kind: "group", key: id, name: label, count: section.count, open, depth: 0 });
		if (open) pushContents(section, id, 1, id);
	}

	return result;
}
