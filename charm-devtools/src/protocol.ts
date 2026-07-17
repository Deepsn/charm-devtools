import { t } from "@rbxts/t";

export const READY_ATTRIBUTE = "__CHARM_DEVTOOLS_READY__";

export type Action = {
	id: string;
	name: string;
	timestamp: number;
	value: unknown;
	atomId: string;
	env: "client" | "server";
};

export const actionGuard: t.check<Action> = t.strictInterface({
	id: t.string,
	name: t.string,
	timestamp: t.numberPositive,
	value: t.any,
	atomId: t.string,
	env: t.union(t.literal("client"), t.literal("server")),
});
