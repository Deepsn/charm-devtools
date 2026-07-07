import { type Atom, listen } from "@rbxts/charm";
import { HttpService, ReplicatedStorage, RunService } from "@rbxts/services";

// biome-ignore lint/suspicious/noExplicitAny: accepts any atom
type AnyAtom = Atom<any>;
type Action = { id: string | number; name: string; timestamp: number; value: unknown };
type HookOptions = {
	label?: string;
};

const REMOTE_NAME = "__CHARM_DEVTOOLS__";
let bridgeEvent = ReplicatedStorage.FindFirstChild(REMOTE_NAME) as BindableEvent;
let bridgeRemote = ReplicatedStorage.FindFirstChild(`${REMOTE_NAME}_REMOTE`) as RemoteEvent;

function dispatch(payload: Action) {
	task.spawn(() => {
		if (RunService.IsClient()) {
			if (!bridgeRemote?.Parent) {
				bridgeRemote = ReplicatedStorage.WaitForChild(`${REMOTE_NAME}_REMOTE`) as RemoteEvent;
			}

			bridgeRemote.FireServer(payload);
			return;
		}

		if (!bridgeEvent?.Parent) {
			bridgeEvent = ReplicatedStorage.WaitForChild(REMOTE_NAME) as BindableEvent;
		}
		bridgeEvent.Fire(payload);
	});
}

export function hookAtom<T extends AnyAtom>(atom: T, options?: HookOptions): T {
	const trace = options?.label ?? debug.traceback(undefined, 2).split("\n")[0];

	listen(atom, (value) => {
		const id = HttpService.GenerateGUID(false);
		const now = DateTime.now().UnixTimestampMillis;
		const payload = { id, name: trace, value, timestamp: now };

		dispatch(payload);
	});

	return atom;
}
