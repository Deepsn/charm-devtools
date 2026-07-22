import { atom } from "@rbxts/charm";
import type { Action } from "@rbxts/charm-devtools";

export const selectedActionId = atom<string | undefined>(undefined);

export const selectedAtomId = atom<string | undefined>(undefined);

export const actionFilter = atom("");

export const atomFilter = atom("");

export type Env = Action["env"];

export type EnvFilter = { readonly [E in Env]: boolean };

export const envFilter = atom<EnvFilter>({ server: true, client: true });

export function toggleEnvFilter(env: Env) {
	envFilter((current) => ({ ...current, [env]: !current[env] }));
}

export type InspectorTab = "tree" | "raw" | "diff";

export const inspectorTab = atom<InspectorTab>("tree");
