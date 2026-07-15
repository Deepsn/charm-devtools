import { computed } from "@rbxts/charm";
import type { Action } from "@rbxts/charm-devtools";
import { history } from "atoms/history";

export const atoms = computed(() => {
	const atomList = new Set<Action["atomId"]>();
	const actions: Action[] = [];

	const historyList = table.clone(history());
	historyList.sort((a, b) => a.timestamp > b.timestamp); // more recent first

	for (const action of historyList) {
		if (!atomList.has(action.atomId)) {
			atomList.add(action.atomId);
			actions.push(action);
		}
	}

	actions.sort((a, b) => a.name < b.name);
	return actions;
});
