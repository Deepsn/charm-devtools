import Vide from "@rbxts/vide";
import { SplitView } from "app/components/split-view";
import { AtomList } from "app/layout/atoms/atom-list";
import { Filter } from "app/layout/atoms/filter";
import { Inspector } from "app/layout/atoms/inspector";

export function Atoms() {
	return <SplitView name="Atoms" filter={<Filter />} list={<AtomList />} inspector={<Inspector />} />;
}
