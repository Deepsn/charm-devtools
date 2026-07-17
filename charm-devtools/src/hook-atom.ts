import { type Atom, listen } from "@rbxts/charm";
import { HttpService } from "@rbxts/services";
import { resolveBridge } from "bridge";
import { IS_SERVER } from "constants";
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

	listen(atom, (value) => {
		bridge.dispatch({
			id: HttpService.GenerateGUID(false),
			atomId,
			name: trace,
			value,
			env: IS_SERVER ? "server" : "client",
			timestamp: DateTime.now().UnixTimestampMillis / 1000,
		} satisfies Action);
	});

	return atom;
}

export function hookAtoms<T extends Record<string, AnyAtom>>(atoms: T): T {
	for (const [name, atom] of pairs(atoms)) {
		hookAtom(atom as AnyAtom, { label: name as string });
	}
	return atoms;
}
