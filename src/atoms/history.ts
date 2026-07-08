import { atom } from "@rbxts/charm";
import type { Action } from "atoms";
import { IS_RUNNING } from "constants/core";

export const history = atom<Action[]>([]);

export function addToHistory(action: Action) {
	history((prev) => [...prev, action]);
}

export function clearHistory() {
	history([]);
}

if (!IS_RUNNING) {
	for (const index of $range(1, 100)) {
		addToHistory({
			id: `action-${index}`,
			name: `Action ${index}`,
			timestamp: DateTime.now().UnixTimestamp + index,
			value: `Value ${index}`,
		});
	}
}
