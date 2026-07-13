import { type Atom, listen } from "@rbxts/charm";
import { HttpService } from "@rbxts/services";
import { resolveBridge } from "bridge";
import type { Action } from "protocol";

// biome-ignore lint/suspicious/noExplicitAny: accepts any atom
type AnyAtom = Atom<any>;

type HookOptions = {
	label?: string;
};

export function hookAtom<T extends AnyAtom>(atom: T, options?: HookOptions): T {
	const trace = options?.label ?? debug.traceback(undefined, 2).split("\n")[0];
	const atomId = HttpService.GenerateGUID(false);
	const bridge = resolveBridge();

	print(`[charm-devtools] hooked atom ${atomId} (${trace})`);

	listen(atom, (value) => {
		print("sent atom update", atomId, trace, value);
		bridge.dispatch({
			id: HttpService.GenerateGUID(false),
			atomId,
			name: trace,
			value,
			timestamp: DateTime.now().UnixTimestampMillis / 1000,
		} satisfies Action);
	});

	return atom;
}
