import { atom } from "@rbxts/charm";
import { IS_RUNNING } from "constants/core";

export type Action = { id: string | number; name: string; timestamp: number; value: unknown };
type Selector<T> = () => T;
export type StateOf<T extends Selector<unknown>> = T extends Selector<infer S> ? S : never;

export const enabled = atom(true);
export const history = atom<Action[]>([]);
export const selectedAction = atom<Action | undefined>();

export const options = atom({
	showAsJson: false,
});
