import { atom } from "@rbxts/charm";
import type { Action } from "atoms";

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
