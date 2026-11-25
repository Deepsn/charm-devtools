import Vide from "@rbxts/vide";
import { offset, udim2 } from "app/hooks/use-px";
import { AtomTree } from "app/layout/state/atom-tree";
import { Inspector } from "app/layout/state/inspector";
import { Toolbar } from "app/layout/state/toolbar";
import { THEME } from "constants/theme";

const BODY_TOP = THEME.filterHeight + THEME.gap;
const MAIN_OFFSET = THEME.listWidth + THEME.gap;

export function State() {
	return (
		<frame Name="State" Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
			<Toolbar />

			<frame
				Name="Body"
				Position={offset(0, BODY_TOP)}
				Size={udim2(1, 0, 1, -BODY_TOP)}
				BackgroundTransparency={1}
				ZIndex={1}
			>
				<frame Name="TreeSlot" Size={udim2(0, THEME.listWidth, 1, 0)} BackgroundTransparency={1}>
					<AtomTree />
				</frame>

				<frame
					Name="InspectorSlot"
					Position={offset(MAIN_OFFSET, 0)}
					Size={udim2(1, -MAIN_OFFSET, 1, 0)}
					BackgroundTransparency={1}
				>
					<Inspector />
				</frame>
			</frame>
		</frame>
	);
}
