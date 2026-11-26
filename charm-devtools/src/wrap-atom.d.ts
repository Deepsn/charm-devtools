import type { Atom, Update } from "@rbxts/charm";

export declare function wrapAtom<T>(read: () => T, write: (update: Update<T>) => T): Atom<T>;
