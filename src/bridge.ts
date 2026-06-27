import { ReplicatedStorage } from "@rbxts/services";
import { t } from "@rbxts/t";
import type { Action } from "atoms";
import { addToHistory } from "atoms/history";
import { IS_SERVER } from "constants/core";

const payloadGuard: t.check<Action> = t.interface({
	id: t.union(t.string, t.number),
	name: t.string,
	timestamp: t.number,
	value: t.any,
});

export const REMOTE_NAME = "__CHARM_DEVTOOLS__";

export function createBridge() {
	let bridgeRemote = IS_SERVER
		? (ReplicatedStorage.FindFirstChild(REMOTE_NAME) as BindableEvent)
		: (ReplicatedStorage.WaitForChild(REMOTE_NAME) as BindableEvent);

	if (!bridgeRemote) {
		// todo: ask the user if they want to create it
		bridgeRemote = new Instance("BindableEvent");
		bridgeRemote.Name = REMOTE_NAME;
		bridgeRemote.Archivable = false;
	}

	bridgeRemote.Event.Connect((payload?: unknown) => {
		if (!payloadGuard(payload)) {
			return warn("[charm-devtools] payload didn't pass type guard, payload received:", payload);
		}

		addToHistory(payload);
	});

	bridgeRemote.Parent = ReplicatedStorage;

	return () => {
		bridgeRemote?.Destroy();
	};
}
