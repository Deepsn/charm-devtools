import { atom } from "@rbxts/charm";
import type { Action } from "atoms";
import { IS_RUNNING } from "constants/core";

export const history = atom<Action[]>([]);

export function getSortedHistory() {
	return history().sort((a, b) => b.timestamp > a.timestamp);
}

export function addToHistory(action: Action) {
	history((prev) => [...prev, action]);
}

if (!IS_RUNNING) {
	for (const index of $range(1, 10)) {
		addToHistory({
			id: `action-${index}`,
			name: `Action ${index}`,
			timestamp: DateTime.now().UnixTimestamp + index,
			value: `Value ${index}`,
		});
	}
}
