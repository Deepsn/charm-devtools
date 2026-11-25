import Vide from "@rbxts/vide";
import { Card } from "app/components/card";
import { Timeline } from "app/components/timeline";
import { EnvDropdown, SearchBox } from "app/layout/state/toolbar";
import { globalTimeline, timelineSearch } from "atoms/timeline";
import { THEME } from "constants/theme";

const BODY_TOP = THEME.filterHeight + THEME.gap;

/** Every update across all atoms, newest first. */
export function TimelinePage() {
	return (
		<frame Name="TimelinePage" Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
			<frame Name="Toolbar" Size={new UDim2(1, 0, 0, THEME.filterHeight)} BackgroundTransparency={1} ZIndex={10}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(0, THEME.gap)}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>
				<EnvDropdown />
				<SearchBox search={timelineSearch} placeholder="Search updates by atom..." />
			</frame>

			<frame
				Name="Body"
				Position={UDim2.fromOffset(0, BODY_TOP)}
				Size={new UDim2(1, 0, 1, -BODY_TOP)}
				BackgroundTransparency={1}
				ZIndex={1}
			>
				<Card name="Timeline" padding={12}>
					<Timeline timeline={globalTimeline} mode="global" />
				</Card>
			</frame>
		</frame>
	);
}
