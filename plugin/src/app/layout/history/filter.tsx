import Vide from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { FilterBar } from "app/components/filter-bar";
import { clearHistory } from "atoms/history";
import { actionFilter, selectedActionId } from "atoms/inspector";

export function Filter() {
	const search = useAtom(actionFilter);

	return (
		<FilterBar
			search={search}
			placeholder="Filter actions…"
			onSearch={(text) => actionFilter(text)}
			actions={[
				{
					label: "Clear",
					onClick: () => {
						clearHistory();
						selectedActionId(undefined);
					},
				},
			]}
		/>
	);
}
