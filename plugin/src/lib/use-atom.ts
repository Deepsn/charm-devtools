import { subscribe } from "@rbxts/charm";
import { cleanup, source } from "@rbxts/vide";

export function useAtom<T>(molecule: () => T): () => T {
	const state = source(molecule());
	cleanup(subscribe(molecule, state));
	return state;
}
