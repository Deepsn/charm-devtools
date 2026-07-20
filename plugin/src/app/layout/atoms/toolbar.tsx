import Vide from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { Toolbar as ToolbarBase } from "app/components/toolbar";
import { clearHistory } from "atoms/history";
import { atomFilter, selectedAtomId } from "atoms/inspector";

export function Toolbar() {
	const search = useAtom(atomFilter);

	return (
		<ToolbarBase
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
