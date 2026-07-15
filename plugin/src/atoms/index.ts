export type { Action } from "@rbxts/charm-devtools";

type Selector<T> = () => T;

export type StateOf<T extends Selector<unknown>> = T extends Selector<infer S> ? S : never;
