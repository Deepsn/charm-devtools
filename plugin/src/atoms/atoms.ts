import { computed } from "@rbxts/charm";
import type { Action } from "@rbxts/charm-devtools";
import { action } from "@rbxts/vide";
import { history } from "atoms/history";

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
