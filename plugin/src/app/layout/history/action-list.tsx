import Vide from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { EnvBadge } from "app/components/env-badge";
import { ListPanel } from "app/components/list-panel";
import { ListRow } from "app/components/list-row";
import { history } from "atoms/history";
import { actionFilter, selectedActionId } from "atoms/inspector";
import { FONT, THEME } from "constants/theme";
import { formatTime, includesText } from "lib/format";

export function ActionList() {
	const historyState = useAtom(history);
	const search = useAtom(actionFilter);
	const selected = useAtom(selectedActionId);

	const rows = () => {
		const query = search();
		const list = historyState().filter((action) => includesText(action.name, query));
		list.sort((a, b) => a.name < b.name);
		return list;
	};

	return ListPanel({
		items: rows,
		emptyText: () => (search() === "" ? "No actions recorded yet" : "No matching actions"),
		render: (action) => (
			<ListRow selected={() => selected() === action().id} onSelect={() => selectedActionId(action().id)}>
				<EnvBadge env={() => action().env} Position={new UDim2(0, 10, 0.5, 0)} AnchorPoint={new Vector2(0, 0.5)} />
				<textlabel
					Name="Label"
					Size={new UDim2(1, -100, 1, 0)}
					Position={new UDim2(0, 60, 0, 0)}
					BackgroundTransparency={1}
					Text={() => action().name}
					TextColor3={THEME.text}
					TextSize={THEME.monoSize}
					Font={FONT.mono}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextTruncate={Enum.TextTruncate.AtEnd}
				/>
				<textlabel
					Name="Time"
					AnchorPoint={new Vector2(1, 0.5)}
					Position={new UDim2(1, -8, 0.5, 0)}
					Size={UDim2.fromOffset(48, THEME.rowHeight)}
					BackgroundTransparency={1}
					Text={() => formatTime(action().timestamp)}
					TextColor3={THEME.textDim}
					TextSize={THEME.fontSize - 2}
					Font={FONT.mono}
					TextXAlignment={Enum.TextXAlignment.Right}
				/>
			</ListRow>
		),
	});
}
