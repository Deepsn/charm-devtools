import Vide, { match } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { ActivityRail } from "app/components/activity-rail";
import { Atoms } from "app/layout/atoms";
import { History } from "app/layout/history";
import { Settings } from "app/layout/settings";
import { currentWindow } from "atoms/window";
import { THEME } from "constants/theme";

const CONTENT_OFFSET = THEME.railWidth + 1;

export function App() {
	const active = useAtom(currentWindow);

	return (
		<frame Name="CharmDevtools" Size={UDim2.fromScale(1, 1)} BackgroundColor3={THEME.windowBg} BorderSizePixel={0}>
			<ActivityRail active={active} />

			<frame
				Name="RailDivider"
				Size={new UDim2(0, 1, 1, 0)}
				Position={new UDim2(0, THEME.railWidth, 0, 0)}
				BackgroundColor3={THEME.divider}
				BorderSizePixel={0}
			/>

			<frame
				Name="Content"
				Size={new UDim2(1, -CONTENT_OFFSET, 1, 0)}
				Position={new UDim2(0, CONTENT_OFFSET, 0, 0)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
			>
				<uipadding
					PaddingTop={new UDim(0, THEME.gap)}
					PaddingBottom={new UDim(0, THEME.gap)}
					PaddingLeft={new UDim(0, THEME.gap)}
					PaddingRight={new UDim(0, THEME.gap)}
				/>
				{match(active)({
					history: () => History(),
					atoms: () => Atoms(),
					settings: () => Settings(),
				})}
			</frame>
		</frame>
	);
}
