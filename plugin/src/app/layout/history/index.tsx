import Vide from "@rbxts/vide";
import { SplitView } from "app/components/split-view";
import { ActionList } from "app/layout/history/action-list";
import { Filter } from "app/layout/history/filter";
import { Inspector } from "app/layout/history/inspector";

export function History() {
	return <SplitView name="History" filter={<Filter />} list={<ActionList />} inspector={<Inspector />} />;
}
