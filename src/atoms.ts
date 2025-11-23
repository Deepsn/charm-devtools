import { atom } from "@rbxts/charm";
import { IS_RUNNING } from "constants/core";

export type Action = { id: string | number; name: string; timestamp: number; value: unknown };

export const enabled = atom(true);
export const history = atom<Action[]>([]);
export const selectedAction = atom<Action | undefined>();
