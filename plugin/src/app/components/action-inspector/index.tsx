import inspect from "@rbxts/inspect";
import Vide, { match } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { Card } from "app/components/card";
import { CodeBlock } from "app/components/code-block";
import { DiffView } from "app/components/diff-view";
import { HEADER_HEIGHT, InspectorHeader } from "app/components/inspector-header";
import { TAB_HEIGHT, type Tab, TabStrip } from "app/components/tab-strip";
import { ValueTree } from "app/components/value-tree";
import type { Action } from "atoms";
import { history } from "atoms/history";
import { type InspectorTab, inspectorTab } from "atoms/inspector";
import { FONT, THEME } from "constants/theme";
import { formatTime } from "lib/format";

const TABS: readonly Tab<InspectorTab>[] = [
	{ id: "tree", label: "Viewer" },
	{ id: "raw", label: "Raw" },
	{ id: "diff", label: "Diff" },
];

const CARD_PADDING = 10;
const BODY_TOP = HEADER_HEIGHT + THEME.gap;
const BODY_HEIGHT_OFFSET = BODY_TOP + THEME.gap + TAB_HEIGHT;

/** Latest action for the same atom that happened before `action`. */
function findPreviousAction(list: readonly Action[], action: Action) {
	let prev: Action | undefined;
	for (const candidate of list) {
		if (candidate.atomId === action.atomId && candidate.timestamp < action.timestamp) {
			if (prev === undefined || candidate.timestamp > prev.timestamp) {
				prev = candidate;
			}
		}
	}
	return prev;
}

export function ActionInspector(props: { action: Action }) {
	const tab = useAtom(inspectorTab);
	const historyState = useAtom(history);
	const action = props.action;

	const previousAction = () => findPreviousAction(historyState(), action);

	return (
		<Card name="Inspector" padding={CARD_PADDING}>
			<InspectorHeader env={action.env} title={action.name} timestamp={action.timestamp} />

			<Card
				name="Body"
				background={THEME.inputBg}
				padding={10}
				Size={new UDim2(1, 0, 1, -BODY_HEIGHT_OFFSET)}
				Position={new UDim2(0, 0, 0, BODY_TOP)}
			>
				<scrollingframe
					Name="Scroll"
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
					BorderSizePixel={0}
					CanvasSize={UDim2.fromScale(0, 0)}
					AutomaticCanvasSize={Enum.AutomaticSize.Y}
					ScrollingDirection={Enum.ScrollingDirection.Y}
					ScrollBarThickness={8}
					ScrollBarImageColor3={THEME.scrollbar}
				>
					<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
					{match(tab)({
						tree: () => <ValueTree value={action.value} />,
						raw: () => <CodeBlock text={inspect(action.value, { depth: 6 })} />,
						diff: () => {
							const prev = previousAction();
							if (prev === undefined) {
								return (
									<textlabel
										Name="NoPrevious"
										Size={UDim2.fromScale(1, 0)}
										AutomaticSize={Enum.AutomaticSize.Y}
										BackgroundTransparency={1}
										Text="No previous action for this atom to diff against"
										TextColor3={THEME.textDim}
										TextSize={THEME.fontSize}
										Font={FONT.ui}
										TextXAlignment={Enum.TextXAlignment.Left}
									/>
								);
							}
							const oldText = inspect(prev.value, { depth: 6 });
							const newText = inspect(action.value, { depth: 6 });
							return (
								<frame Name="Diff" Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
									<uilistlayout
										FillDirection={Enum.FillDirection.Vertical}
										SortOrder={Enum.SortOrder.LayoutOrder}
										HorizontalAlignment={Enum.HorizontalAlignment.Center}
									/>
									<frame Name="Headers" Size={new UDim2(1, 0, 0, 22)} BackgroundTransparency={1}>
										<uilistlayout
											FillDirection={Enum.FillDirection.Horizontal}
											SortOrder={Enum.SortOrder.LayoutOrder}
											VerticalAlignment={Enum.VerticalAlignment.Center}
										/>
										<textlabel
											Name="OldHeader"
											Size={new UDim2(0.5, -2, 1, 0)}
											BackgroundTransparency={1}
											Text={`− ${prev.name} (${formatTime(prev.timestamp)})`}
											TextColor3={Color3.fromRGB(197, 134, 192)}
											TextSize={THEME.fontSize - 1}
											Font={FONT.medium}
											TextXAlignment={Enum.TextXAlignment.Left}
											TextTruncate={Enum.TextTruncate.AtEnd}
										/>
										<textlabel
											Name="NewHeader"
											Size={new UDim2(0.5, -2, 1, 0)}
											BackgroundTransparency={1}
											Text={`+ ${action.name} (${formatTime(action.timestamp)})`}
											TextColor3={Color3.fromRGB(152, 195, 121)}
											TextSize={THEME.fontSize - 1}
											Font={FONT.medium}
											TextXAlignment={Enum.TextXAlignment.Left}
											TextTruncate={Enum.TextTruncate.AtEnd}
										/>
									</frame>
									<DiffView oldText={oldText} newText={newText} />
								</frame>
							);
						},
					})}
				</scrollingframe>
			</Card>

			{TabStrip<InspectorTab>({
				tabs: TABS,
				active: tab,
				onSelect: (id) => inspectorTab(id),
				Position: new UDim2(0, 0, 1, 0),
				AnchorPoint: new Vector2(0, 1),
			})}
		</Card>
	);
}
