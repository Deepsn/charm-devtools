import type { Atom, Update } from "@rbxts/charm";

export function wrapAtom<T>(inner: Atom<T>, write: (update: Update<T>) => T): Atom<T> {
	const atomOper = (...args: [update?: Update<T>]) => {
		if (select("#", ...args) === 0) {
			return inner();
		}
		return write(args[0] as Update<T>);
	};

	return atomOper;
}
