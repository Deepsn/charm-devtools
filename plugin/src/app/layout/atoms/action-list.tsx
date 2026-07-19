import Vide, { source } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { VirtualizedList } from "app/components/virtualized-list";
import { atoms } from "atoms/atoms";
import { filter, selectedAtomId } from "atoms/inspector";
import { FONT, THEME } from "constants/theme";
import { includesText } from "lib/format";

export function ActionList() {
	const atomsState = useAtom(atoms);
	const search = useAtom(filter);
	const selected = useAtom(selectedAtomId);

	const rows = () => {
		const query = search();
		const list = atomsState().filter((action) => includesText(action.name, query));
		list.sort((a, b) => a.name < b.name);
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
			const isSelected = () => selected() === action().atomId;
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
					MouseButton1Click={() => selectedAtomId(action().atomId)}
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
						Name="Label"
						Size={new UDim2(1, -62, 1, 0)}
						Position={new UDim2(0, 10, 0, 0)}
						BackgroundTransparency={1}
						Text={() => action().name}
						TextColor3={THEME.text}
						TextSize={THEME.fontSize}
						Font={FONT.medium}
						TextXAlignment={Enum.TextXAlignment.Left}
						TextTruncate={Enum.TextTruncate.AtEnd}
					/>
				</textbutton>
			);
		},
	});
}
