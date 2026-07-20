import Vide from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { FilterBar } from "app/components/filter-bar";
import { clearHistory } from "atoms/history";
import { atomFilter, selectedAtomId } from "atoms/inspector";

export function Filter() {
	const search = useAtom(atomFilter);

	return (
		<FilterBar
			search={search}
			placeholder="Filter atoms…"
			onSearch={(text) => atomFilter(text)}
			actions={[
				{
					label: "Clear",
					onClick: () => {
						clearHistory();
						selectedAtomId(undefined);
					},
				},
			]}
		/>
	);
}
