import Vide, { cleanup, effect, untrack } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { EnvBadge } from "app/components/env-badge";
import { ListPanel } from "app/components/list-panel";
import { ListRow } from "app/components/list-row";
import { createScrollControl } from "app/components/virtualized-list/scroll-control";
import { history } from "atoms/history";
import { actionFilter, selectedActionId } from "atoms/inspector";
import { FONT, THEME } from "constants/theme";
import { formatTime, includesText } from "lib/format";

export function ActionList() {
	const historyState = useAtom(history);
	const search = useAtom(actionFilter);
	const selected = useAtom(selectedActionId);
	const scrollControl = createScrollControl();

	const rows = () => {
		const query = search();
		const list = historyState().filter((action) => includesText(action.name, query));
		return table.clone(list).sort((a, b) => a.timestamp < b.timestamp);
	};

	effect(() => {
		// watch for history changes
		historyState();

		// wait for virtualized list to update
		const thread = task.defer(() => {
			untrack(() => {
				const scrollingFrame = scrollControl.getScrollingFrame();
				if (!scrollingFrame) return;
				const canvasSize = scrollingFrame.CanvasSize;
				const currentCanvasPosition = scrollControl.getCanvasPosition();

				if (currentCanvasPosition.Y < canvasSize.Y.Offset - THEME.rowHeight * 2) return;

				scrollControl.setCanvasPosition(new Vector2(0, canvasSize.Y.Offset));
			});
		});

		cleanup(thread);
	});

	return (
		<ListPanel
			scrollControl={scrollControl}
			items={rows}
			emptyText={() => (search() === "" ? "No actions recorded yet" : "No matching actions")}
			render={(action) => (
				<ListRow selected={() => selected() === action().id} onSelect={() => selectedActionId(action().id)}>
					<EnvBadge env={() => action().env} Position={new UDim2(0, 10, 0.5, 0)} AnchorPoint={new Vector2(0, 0.5)} />
					<textlabel
						Name="Label"
						Size={new UDim2(1, -122, 1, 0)}
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
			)}
		/>
	);
}
