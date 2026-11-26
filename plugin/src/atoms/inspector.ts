import { atom } from "@rbxts/charm";
import type { ValueKind } from "lib/format";

export type SortMode = "name" | "recent";

export type InspectorWindow = "code" | "tree" | "dependents";

export const selectedAtomId = atom<string | undefined>(undefined);

export const atomSearch = atom("");

export const sortMode = atom<SortMode>("name");

export const inspectorWindow = atom<InspectorWindow>("code");

/** Which environment the inspector shows for atoms that exist on both the client and server. */
export type EnvView = "both" | "client" | "server";

export const envView = atom<EnvView>("both");

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
