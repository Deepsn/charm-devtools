import Vide, { match } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { ActivityRail } from "app/components/activity-rail";
import { px, udim, udim2, usePx } from "app/hooks/use-px";
import { Settings } from "app/layout/settings";
import { State } from "app/layout/state";
import { TimelinePage } from "app/layout/timeline";
import { currentWindow } from "atoms/window";
import { THEME } from "constants/theme";

export function App() {
	usePx();

	const active = useAtom(currentWindow);
	const contentOffset = () => px(THEME.railWidth)() + 1;

	return (
		<frame Name="CharmDevtools" Size={UDim2.fromScale(1, 1)} BackgroundColor3={THEME.windowBg} BorderSizePixel={0}>
			<ActivityRail active={active} />

			<frame
				Name="RailDivider"
				Size={new UDim2(0, 1, 1, 0)}
				Position={udim2(0, THEME.railWidth, 0, 0)}
				BackgroundColor3={THEME.divider}
				BorderSizePixel={0}
			/>

			<frame
				Name="Content"
				Size={() => new UDim2(1, -contentOffset(), 1, 0)}
				Position={() => new UDim2(0, contentOffset(), 0, 0)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
			>
				<uipadding
					PaddingTop={udim(0, THEME.gap)}
					PaddingBottom={udim(0, THEME.gap)}
					PaddingLeft={udim(0, THEME.gap)}
					PaddingRight={udim(0, THEME.gap)}
				/>

				{match(active)({
					state: () => State(),
					timeline: () => TimelinePage(),
					settings: () => Settings(),
				})}
			</frame>
		</frame>
	);
}
