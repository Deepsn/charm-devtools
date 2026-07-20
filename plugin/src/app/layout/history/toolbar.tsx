import Vide from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { Toolbar as ToolbarBase } from "app/components/toolbar";
import { clearHistory } from "atoms/history";
import { actionFilter, selectedActionId } from "atoms/inspector";

export function Toolbar() {
	const search = useAtom(actionFilter);

	return (
		<ToolbarBase
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
