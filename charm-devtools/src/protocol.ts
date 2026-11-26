import { t } from "@rbxts/t";

export const READY_ATTRIBUTE = "__CHARM_DEVTOOLS_READY__";

export type SourceLocation = {
	script: string;
	line: number;
};

export type Action = {
	id: string;
	name: string;
	timestamp: number;
	value: unknown;
	atomId: string;
	env: "client" | "server";
	source?: SourceLocation;
};

export type DependentKind = "atom" | "computed" | "effect" | "listener";

export type Dependent = {
	id: string;
	kind: DependentKind;
	name: string;
	depth: number;
	source?: SourceLocation;
};

export type DependentsUpdate = {
	type: "dependents";
	atomId: string;
	env: Action["env"];
	timestamp: number;
	dependents: Dependent[];
};

const envGuard = t.union(t.literal("client"), t.literal("server"));
const sourceGuard = t.strictInterface({ script: t.string, line: t.number });

export const actionGuard: t.check<Action> = t.strictInterface({
	id: t.string,
	name: t.string,
	timestamp: t.numberPositive,
	value: t.any,
	atomId: t.string,
	env: envGuard,
	source: t.optional(sourceGuard),
});

export const dependentsGuard: t.check<DependentsUpdate> = t.strictInterface({
	type: t.literal("dependents"),
	atomId: t.string,
	env: envGuard,
	timestamp: t.numberPositive,
	dependents: t.array(
		t.strictInterface({
			id: t.string,
			kind: t.union(t.literal("atom"), t.literal("computed"), t.literal("effect"), t.literal("listener")),
			name: t.string,
			depth: t.integer,
			source: t.optional(sourceGuard),
		}),
	),
});
