type Selector<T> = () => T;

export type Action = { id: string; name: string; timestamp: number; value: unknown };
export type StateOf<T extends Selector<unknown>> = T extends Selector<infer S> ? S : never;
