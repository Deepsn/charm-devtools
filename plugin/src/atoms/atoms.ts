import { computed } from "@rbxts/charm";
import type { Action } from "@rbxts/charm-devtools";
import { action } from "@rbxts/vide";
import { history } from "atoms/history";
import { envView, selectedAtomId } from "atoms/inspector";
import { autoNamedLine, shortestUniquePaths } from "lib/format";

export const atoms = computed(() => {
	const latest = new Map<Action["atomId"], Action>();

	for (const action of history()) {
		const current = latest.get(action.atomId);
		if (current === undefined || action.timestamp >= current.timestamp) {
			latest.set(action.atomId, action);
		}
	}

	const actions: Action[] = [];
	for (const [, action] of latest) actions.push(action);
	action;
	actions.sort((a, b) => a.name < b.name);
	return actions;
});

/**
 * Display name of every atom, keyed by its full name. Unlabeled atoms are shown as `script:line` using the shortest
 * script path that tells them apart from other scripts, e.g. `controller:44` or `Client.controller:44`.
 */
export const atomLabels = computed(() => {
	const scripts: string[] = [];
	for (const action of atoms()) {
		if (action.source !== undefined && autoNamedLine(action) !== undefined) scripts.push(action.source.script);
	}
	const shortScripts = shortestUniquePaths(scripts);

	const labels = new Map<string, string>();
	for (const action of atoms()) {
		const line = autoNamedLine(action);
		const scriptLabel = action.source !== undefined ? shortScripts.get(action.source.script) : undefined;
		labels.set(action.name, line !== undefined && scriptLabel !== undefined ? `${scriptLabel}:${line}` : action.name);
	}
	return labels;
});

/** Atoms created by the same code on both environments share a key. */
function pairKey(action: Action) {
	const source = action.source;
	return source !== undefined ? `${action.name}@${source.script}:${source.line}` : action.name;
}

/** Maps the id of an atom that exists on both the client and server to the latest update of its counterpart. */
export const counterparts = computed(() => {
	const groups = new Map<string, Action[]>();
	for (const action of atoms()) {
		const key = pairKey(action);
		const group = groups.get(key);
		if (group !== undefined) {
			group.push(action);
		} else {
			groups.set(key, [action]);
		}
	}

	const result = new Map<string, Action>();
	for (const [, group] of groups) {
		if (group.size() !== 2) continue;
		const [first, second] = [group[0], group[1]];
		if (first.env === second.env) continue;
		result.set(first.atomId, second);
		result.set(second.atomId, first);
	}
	return result;
});

export type AtomPair = { readonly [K in Action["env"]]?: Action };

/** Latest update of the selected atom on each environment it exists on. */
export const selectedPair = computed((): AtomPair | undefined => {
	const id = selectedAtomId();
	if (id === undefined) return undefined;

	const selected = atoms().find((action) => action.atomId === id);
	if (selected === undefined) return undefined;

	const pair: { [K in Action["env"]]?: Action } = {};
	pair[selected.env] = selected;
	const other = counterparts().get(id);
	if (other !== undefined) pair[other.env] = other;
	return pair;
});

/** Whether the selected atom exists on both environments. */
export const selectedIsMerged = computed(() => {
	const pair = selectedPair();
	return pair?.client !== undefined && pair.server !== undefined;
});

/** Environments of the selected atom shown in the inspector, honoring the environment view when merged. */
export const shownEnvs = computed((): Action["env"][] => {
	const pair = selectedPair();
	if (pair === undefined) return [];
	if (!selectedIsMerged()) return pair.client !== undefined ? ["client"] : ["server"];

	const view = envView();
	return view === "both" ? ["client", "server"] : [view];
});

/** Atom ids of the environments shown in the inspector. */
export const shownAtomIds = computed(() => {
	const pair = selectedPair();
	const ids: string[] = [];
	if (pair === undefined) return ids;
	for (const env of shownEnvs()) {
		const action = pair[env];
		if (action !== undefined) ids.push(action.atomId);
	}
	return ids;
});
