import { subscribe } from "@rbxts/charm";
import { cleanup, source } from "@rbxts/vide";

/**
 * Bridges a Charm atom (or derived selector) into a Vide source.
 *
 * The returned source is seeded with the current value and kept in sync with
 * the atom. The subscription is disposed automatically when the surrounding
 * Vide reactive scope is destroyed, so this must be called from within a
 * component (i.e. under `mount`/`root`).
 */
export function useAtom<T>(molecule: () => T): () => T {
	const state = source(molecule());
	cleanup(subscribe(molecule, (value) => state(value)));
	return state;
}
