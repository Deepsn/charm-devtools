import { atom } from "@rbxts/charm";

export type Action = { id: string; name: string; value: unknown };

export const enabled = atom(true);
export const history = atom<Action[]>([]);
export const selectedAction = atom<Action | undefined>();
