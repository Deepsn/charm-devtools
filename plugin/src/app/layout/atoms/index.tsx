import Vide from "@rbxts/vide";
import { SplitView } from "app/components/split-view";
import { AtomList } from "app/layout/atoms/atom-list";
import { Inspector } from "app/layout/atoms/inspector";
import { Toolbar } from "app/layout/atoms/toolbar";

export function Atoms() {
	return <SplitView name="Atoms" toolbar={<Toolbar />} list={<AtomList />} inspector={<Inspector />} />;
}
