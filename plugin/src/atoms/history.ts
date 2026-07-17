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
			env: index % 2 === 0 ? "server" : "client",
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
				wow: "123",
			},
		},
		env: "server",
	});

	addToHistory({
		id: "action-102",
		atomId: "atom-101",
		name: "Action 102",
		timestamp: DateTime.now().UnixTimestamp + 102,
		value: {
			huge: "complexx",
			object: {
				that: "cant",
				be: {},
				wow: 123,
			},
		},
		env: "client",
	});
}
