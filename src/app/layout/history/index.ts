import Iris from "@rbxts/iris";
import { VirtualizedList } from "app/components/virtualized-list";
import { getSortedHistory } from "atoms/history";

export function renderHistory() {
	VirtualizedList.Render();
	for (const item of getSortedHistory()) {
		Iris.Text([item.name]);
	}
	VirtualizedList.End();
}
