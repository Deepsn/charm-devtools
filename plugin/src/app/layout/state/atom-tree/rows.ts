import type { Action } from "atoms";
import { type EnvScope, inScope } from "atoms/inspector";
import { includesText, splitAtomName, type ValueKind, valueKind } from "lib/format";
import type { TreeRow } from "./types";

interface Leaf {
	action: Action;
	label: string;
}

interface Group {
	name: string;
	leaves: Leaf[];
	latest: number;
}

export interface TreeRowOptions {
	query: string;
	scope: EnvScope;
	kinds: Readonly<Record<ValueKind, boolean>>;
	collapsed: ReadonlySet<string>;
	byRecent: boolean;
}

export function buildTreeRows(actions: readonly Action[], options: TreeRowOptions): TreeRow[] {
	const { query, scope, kinds, collapsed, byRecent } = options;

	const groups = new Map<string, Group>();
	const loose: Leaf[] = [];

	for (const action of actions) {
		if (!inScope(scope, action.env)) continue;
		if (!kinds[valueKind(action.value)]) continue;
		if (!includesText(action.name, query)) continue;

		const path = splitAtomName(action.name);
		const leaf = { action, label: path.leaf };
		if (path.group === undefined) {
			loose.push(leaf);
			continue;
		}

		let group = groups.get(path.group);
		if (group === undefined) {
			group = { name: path.group, leaves: [], latest: 0 };
			groups.set(path.group, group);
		}
		group.leaves.push(leaf);
		group.latest = math.max(group.latest, action.timestamp);
	}

	const compareLeaves = (a: Leaf, b: Leaf) =>
		byRecent ? a.action.timestamp > b.action.timestamp : a.label.lower() < b.label.lower();

	const sortedGroups: Group[] = [];
	for (const [, group] of groups) sortedGroups.push(group);
	sortedGroups.sort((a, b) => (byRecent ? a.latest > b.latest : a.name.lower() < b.name.lower()));

	const result: TreeRow[] = [];

	for (const group of sortedGroups) {
		const open = query !== "" || !collapsed.has(group.name);
		result.push({ kind: "group", name: group.name, count: group.leaves.size(), open });
		if (!open) continue;

		group.leaves.sort(compareLeaves);
		for (const leaf of group.leaves) {
			result.push({ kind: "atom", action: leaf.action, label: leaf.label, nested: true });
		}
	}

	loose.sort(compareLeaves);
	for (const leaf of loose) {
		result.push({ kind: "atom", action: leaf.action, label: leaf.label, nested: false });
	}

	return result;
}
