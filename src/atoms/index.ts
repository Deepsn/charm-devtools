import { atom } from "@rbxts/charm";

export type Action = { id: string; name: string; timestamp: number; value: unknown };
type Selector<T> = () => T;
export type StateOf<T extends Selector<unknown>> = T extends Selector<infer S> ? S : never;

export const enabled = atom(false);
export const selectedAction = atom<Action | undefined>();

export const options = atom({
	showAsJson: false,
});
