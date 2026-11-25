import { atom } from "@rbxts/charm";
import type { Action } from "@rbxts/charm-devtools";
import type { ValueKind } from "lib/format";

export type Env = Action["env"];

export type EnvScope = "all" | Env;

export type SortMode = "name" | "recent";

export type ValueView = "code" | "tree";

export const selectedAtomId = atom<string | undefined>(undefined);

export const atomSearch = atom("");

export const envScope = atom<EnvScope>("all");

export const sortMode = atom<SortMode>("name");

export const valueView = atom<ValueView>("code");

export const kindFilter = atom<{ readonly [K in ValueKind]: boolean }>({
	table: true,
	boolean: true,
	number: true,
	string: true,
	other: true,
});

export function toggleKindFilter(kind: ValueKind) {
	kindFilter((current) => ({ ...current, [kind]: !current[kind] }));
}

export const collapsedGroups = atom<ReadonlySet<string>>(new Set());

export function toggleGroup(group: string) {
	collapsedGroups((current) => {
		const nextSet = new Set<string>([...current]);
		if (nextSet.has(group)) {
			nextSet.delete(group);
		} else {
			nextSet.add(group);
		}
		return nextSet;
	});
}

export function inScope(scope: EnvScope, env: Env) {
	return scope === "all" || scope === env;
}
