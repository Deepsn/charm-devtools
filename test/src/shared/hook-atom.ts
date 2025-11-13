import { type Atom, atom, subscribe } from "@rbxts/charm";
import { HttpService, ReplicatedStorage } from "@rbxts/services";

// biome-ignore lint/suspicious/noExplicitAny: accepts any atom
type AnyAtom = Atom<any>;
type Action = { id: string; name: string; value: unknown };

const bridge = ReplicatedStorage.WaitForChild("__CHARM_DEVTOOLS__") as BindableEvent;

const queue = atom<Action[]>([]);
const ready = atom(false);

subscribe(queue, (newQueue) => {
	if (!ready()) return;
	if (newQueue.size() === 0) return;

	for (const payload of newQueue) {
		bridge.Fire("patch", payload);
	}

	queue([]);
});

const conn = bridge.Event.Connect(() => {
	ready(true);
	conn.Disconnect();
});

export function hookAtom<T extends AnyAtom>(atom: T): T {
	const trace = debug.traceback(undefined, 2).split("\n")[0];

	subscribe(atom, (value) => {
		const id = HttpService.GenerateGUID(false);
		queue((q) => {
			return [...q, { id, name: trace, value: value }];
		});
	});

	return atom;
}
