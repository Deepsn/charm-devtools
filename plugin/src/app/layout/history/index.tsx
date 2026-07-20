import Vide from "@rbxts/vide";
import { SplitView } from "app/components/split-view";
import { ActionList } from "app/layout/history/action-list";
import { Inspector } from "app/layout/history/inspector";
import { Toolbar } from "app/layout/history/toolbar";

export function History() {
	return <SplitView name="History" toolbar={<Toolbar />} list={<ActionList />} inspector={<Inspector />} />;
}
