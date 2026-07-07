import Iris from "@rbxts/iris";
import { createVirtualizedList, type VirtualizedListArgs } from "app/components/virtualized-list/component";

export type { VirtualizedListArgs } from "app/components/virtualized-list/component";

export namespace VirtualizedList {
	const insert = createVirtualizedList();

	export function Render(args: VirtualizedListArgs = {}) {
		return insert([args.Height, args.RowHeight] as Array<defined>);
	}

	export function End() {
		Iris.End();
	}
}
