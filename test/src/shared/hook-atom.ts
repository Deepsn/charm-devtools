import { type Atom, listen } from "@rbxts/charm";
import { HttpService, ReplicatedStorage } from "@rbxts/services";

// biome-ignore lint/suspicious/noExplicitAny: accepts any atom
type AnyAtom = Atom<any>;
type Action = { id: string | number; name: string; timestamp: number; value: unknown };
type HookOptions = {
	label?: string;
};

const REMOTE_NAME = "__CHARM_DEVTOOLS__";
let _bridge = ReplicatedStorage.FindFirstChild(REMOTE_NAME) as BindableEvent;

function dispatch(payload: Action) {
	task.spawn(() => {
		if (!_bridge) {
			_bridge = ReplicatedStorage.WaitForChild(REMOTE_NAME) as BindableEvent;
		}

		_bridge.Fire(payload);
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
