import { atom } from "@rbxts/charm";

type Action = string;

export const history = atom<Action[]>(["1", "2", "3"]);
export const selectedAction = atom<Action | undefined>();
