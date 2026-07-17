import Vide, { source } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { VirtualizedList } from "app/components/virtualized-list";
import { history } from "atoms/history";
import { filter, selectedActionId } from "atoms/inspector";
import { FONT, THEME } from "constants/theme";
import { envColor, formatTime, includesText } from "lib/format";

export function ActionList() {
	const historyState = useAtom(history);
	const search = useAtom(filter);
	const selected = useAtom(selectedActionId);

	const rows = () => {
		const query = search();
		const list = historyState().filter((action) => includesText(action.name, query));
		list.sort((a, b) => a.timestamp < b.timestamp);
		return list;
	};

	return VirtualizedList({
		items: rows,
		rowHeight: THEME.rowHeight,
		spacing: THEME.rowSpacing,
		Size: UDim2.fromScale(1, 1),
		BackgroundColor3: THEME.panelBg,
		BackgroundTransparency: 0,
		ScrollBarImageColor3: THEME.scrollbar,
		render: (action) => {
			const isSelected = () => selected() === action().id;
			const hovered = source(false);

			return (
				<textbutton
					Name="Row"
					Size={UDim2.fromScale(1, 1)}
					BackgroundColor3={() => (isSelected() ? THEME.rowSelected : THEME.rowHover)}
					BackgroundTransparency={() => (isSelected() || hovered() ? 0 : 1)}
					BorderSizePixel={0}
					AutoButtonColor={false}
					Text=""
					Activated={() => selectedActionId(action().id)}
					MouseEnter={() => hovered(true)}
					MouseLeave={() => hovered(false)}
				>
					<frame
						Name="Accent"
						Size={new UDim2(0, 2, 1, 0)}
						BackgroundColor3={THEME.accent}
						BorderSizePixel={0}
						Visible={isSelected}
					/>
					<textlabel
						Name="Env"
						Size={new UDim2(0, 44, 0, 16)}
						Position={new UDim2(0, 10, 0.5, 0)}
						AnchorPoint={new Vector2(0, 0.5)}
						BackgroundColor3={() => envColor(action().env)}
						BackgroundTransparency={0}
						BorderSizePixel={0}
						Text={() => action().env.upper()}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextSize={THEME.fontSize - 3}
						Font={FONT.bold}
						TextXAlignment={Enum.TextXAlignment.Center}
						TextYAlignment={Enum.TextYAlignment.Center}
					>
						<uicorner CornerRadius={new UDim(0, 3)} />
					</textlabel>
					<textlabel
						Name="Label"
						Size={new UDim2(1, -118, 1, 0)}
						Position={new UDim2(0, 60, 0, 0)}
						BackgroundTransparency={1}
						Text={() => action().name}
						TextColor3={THEME.text}
						TextSize={THEME.fontSize}
						Font={FONT.medium}
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
				</textbutton>
			);
		},
	});
}
