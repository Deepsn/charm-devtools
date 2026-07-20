import Vide from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { EnvBadge } from "app/components/env-badge";
import { ListPanel } from "app/components/list-panel";
import { ListRow } from "app/components/list-row";
import { atoms } from "atoms/atoms";
import { atomFilter, selectedAtomId } from "atoms/inspector";
import { FONT, THEME } from "constants/theme";
import { includesText } from "lib/format";

export function AtomList() {
	const atomsState = useAtom(atoms);
	const search = useAtom(atomFilter);
	const selected = useAtom(selectedAtomId);

	const rows = () => {
		const query = search();
		const list = atomsState().filter((action) => includesText(action.name, query));
		list.sort((a, b) => a.name < b.name);
		return list;
	};

	return ListPanel({
		items: rows,
		emptyText: () => (search() === "" ? "No atoms hooked yet" : "No matching atoms"),
		render: (action) => (
			<ListRow selected={() => selected() === action().atomId} onSelect={() => selectedAtomId(action().atomId)}>
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
			</ListRow>
		),
	});
}
