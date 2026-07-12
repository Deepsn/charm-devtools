import { atom } from "@rbxts/charm";
import type { Action } from "atoms";
import { IS_RUNNING } from "constants/core";

export const history = atom<Action[]>([]);

export function addToHistory(action: Action) {
	history((prev) => [...prev, action]);
}

export function modifyHistory(id: string | number, newAction: Action) {
	history((prev) => {
		return prev.map((action) => {
			if (action.id === id) {
				return newAction;
			}
			return action;
		});
	});
}

export function clearHistory() {
	history([]);
}

if (!IS_RUNNING) {
	for (const index of $range(1, 100)) {
		addToHistory({
			id: `action-${index}`,
			atomId: `atom-${index}`,
			name: `Action ${index}`,
			timestamp: DateTime.now().UnixTimestamp + index,
			value: `Value ${index}`,
		});
	}

	addToHistory({
		id: "action-101",
		atomId: "atom-101",
		name: "Action 101",
		timestamp: DateTime.now().UnixTimestamp + 101,
		value: {
			huge: "complex",
			object: {
				that: "can",
				be: {
					nested: "deeply",
				},
			},
		},
	});
}
