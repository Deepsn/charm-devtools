import Iris from "@rbxts/iris";
import { getSortedHistory } from "atoms/history";

export function renderHistory() {
	Iris.Text(["Charm nodes history here"]);

	for (const item of getSortedHistory()) {
		Iris.Text([item.name]);
	}
}
