import { type Atom, listen } from "@rbxts/charm";
import { HttpService, ReplicatedStorage, RunService } from "@rbxts/services";
import { type Action, BRIDGE_NAME, BRIDGE_REMOTE_NAME } from "./protocol";

// biome-ignore lint/suspicious/noExplicitAny: accepts any atom
type AnyAtom = Atom<any>;

type HookOptions = {
	label?: string;
};

let bridgeEvent: BindableEvent | undefined;
let bridgeRemote: RemoteEvent | undefined;

function dispatch(payload: Action) {
	task.spawn(() => {
		if (!bridgeEvent?.Parent) {
			bridgeEvent = ReplicatedStorage.WaitForChild(BRIDGE_NAME) as BindableEvent;
		}

		if (!bridgeRemote?.Parent) {
			bridgeRemote = ReplicatedStorage.WaitForChild(BRIDGE_REMOTE_NAME) as RemoteEvent;
		}

		while (ReplicatedStorage.GetAttribute("ready") !== 2) {
			ReplicatedStorage.GetAttributeChangedSignal("ready").Wait();
		}

		bridgeEvent.Fire(payload);
		RunService.IsServer() ? bridgeRemote.FireAllClients(payload) : bridgeRemote.FireServer(payload);
	});
}

export function hookAtom<T extends AnyAtom>(atom: T, options?: HookOptions): T {
	const trace = options?.label ?? debug.traceback(undefined, 2).split("\n")[0];
	const atomId = HttpService.GenerateGUID(false);

	listen(atom, (value) => {
		const now = DateTime.now().UnixTimestampMillis / 1000;
		const id = HttpService.GenerateGUID(false);
		const payload = {
			id,
			atomId,
			name: trace,
			value,
			timestamp: now,
		} satisfies Action;

		dispatch(payload);
	});

	return atom;
}
