import { t } from "@rbxts/t";

export const BRIDGE_NAME = "__CHARM_DEVTOOLS__";
export const BRIDGE_REMOTE_NAME = `${BRIDGE_NAME}_REMOTE`;

export type Action = { id: string; name: string; timestamp: number; value: unknown; atomId: string };

export const actionGuard: t.check<Action> = t.strictInterface({
	id: t.string,
	name: t.string,
	timestamp: t.numberPositive,
	value: t.any,
	atomId: t.string,
});
