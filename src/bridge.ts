import { ReplicatedStorage } from "@rbxts/services";
import { t } from "@rbxts/t";
import { type Action, history } from "atoms";

const REMOTE_NAME = "__CHARM_DEVTOOLS__";

const payloadGuard: t.check<Action> = t.interface({
	id: t.string,
	name: t.string,
	value: t.any,
});

export const bridgeRemote =
	(ReplicatedStorage.FindFirstChild(REMOTE_NAME) as BindableEvent) ?? new Instance("BindableEvent");

bridgeRemote.Event.Connect((payloadType: "ping" | "patch", payload?: unknown) => {
	assert(payloadType !== undefined);

	if (payloadType === "ping") {
		return;
	}

	if (!payloadGuard(payload)) {
		return warn("[charm-devtools] payload didn't pass type guard, payload received:", payload);
	}

	history((prev) => [...prev, payload]);
});

bridgeRemote.Name = REMOTE_NAME;
bridgeRemote.Parent = ReplicatedStorage;

bridgeRemote.Fire("ping");
