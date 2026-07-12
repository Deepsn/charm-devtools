import { ReplicatedStorage } from "@rbxts/services";
import { t } from "@rbxts/t";
import type { Action } from "atoms";
import { addToHistory } from "atoms/history";
import { IS_RUNNING, IS_SERVER } from "constants/core";

const payloadGuard: t.check<Action> = t.strictInterface({
	id: t.string,
	name: t.string,
	timestamp: t.numberPositive,
	value: t.any,
	atomId: t.string,
});

export const BRIDGE_NAME = "__CHARM_DEVTOOLS__";

export function createBridge() {
	let bridgeEvent = IS_SERVER
		? (ReplicatedStorage.FindFirstChild(BRIDGE_NAME) as BindableEvent)
		: (ReplicatedStorage.WaitForChild(BRIDGE_NAME) as BindableEvent);

	let bridgeRemote = IS_SERVER
		? (ReplicatedStorage.FindFirstChild(`${BRIDGE_NAME}_REMOTE`) as RemoteEvent)
		: (ReplicatedStorage.WaitForChild(`${BRIDGE_NAME}_REMOTE`) as RemoteEvent);

	// todo: ask the user if they want to create the bridge

	if (!bridgeEvent) {
		bridgeEvent = new Instance("BindableEvent");
		bridgeEvent.Name = BRIDGE_NAME;
		bridgeEvent.Archivable = false;
	}

	if (!bridgeRemote) {
		bridgeRemote = new Instance("RemoteEvent");
		bridgeRemote.Name = `${BRIDGE_NAME}_REMOTE`;
		bridgeRemote.Archivable = false;
	}


	function onPayload(payload: unknown) {
		if (payload === "ready") {
			const readyCount = (ReplicatedStorage.GetAttribute("ready") as number) ?? 0;
			ReplicatedStorage.SetAttribute("ready", readyCount + 1);
			return;
		}

		if (!payloadGuard(payload)) {
			return warn("[charm-devtools] payload didn't pass type guard, payload received:", payload);
		}

		addToHistory(payload);
	}

	bridgeEvent.Event.Connect((payload?: unknown) => onPayload(payload));
	if (IS_SERVER) {
		bridgeRemote.OnServerEvent.Connect((_player, payload?: unknown) => onPayload(payload));
	} else {
		bridgeRemote.OnClientEvent.Connect((payload?: unknown) => onPayload(payload));
	}

	bridgeEvent.Parent = ReplicatedStorage;
	bridgeRemote.Parent = ReplicatedStorage;


	if (IS_RUNNING) { 
		if (IS_SERVER) {
			const readyCount = (ReplicatedStorage.GetAttribute("ready") as number) ?? 0;
			ReplicatedStorage.SetAttribute("ready", readyCount + 1);
		} else {
			bridgeRemote.FireServer("ready");
		}
	}

	return () => {
		bridgeEvent?.Destroy();
		bridgeRemote?.Destroy();
	};
}
