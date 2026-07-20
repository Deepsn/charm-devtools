import inspect from "@rbxts/inspect";
import Vide, { match } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
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
	{ id: "tree", label: "Tree" },
	{ id: "raw", label: "Raw" },
	{ id: "diff", label: "Diff" },
];

const BODY_OFFSET = HEADER_HEIGHT + TAB_HEIGHT;

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

/** Header + Tree/Raw/Diff tabs for a single action, shared by the history and atoms inspectors. */
export function ActionInspector(props: { action: Action }) {
	const tab = useAtom(inspectorTab);
	const historyState = useAtom(history);
	const action = props.action;

	const previousAction = () => findPreviousAction(historyState(), action);

	return (
		<frame Name="Content" Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
			<InspectorHeader env={action.env} title={action.name} timestamp={action.timestamp} />

			{TabStrip<InspectorTab>({
				tabs: TABS,
				active: tab,
				onSelect: (id) => inspectorTab(id),
				Position: new UDim2(0, 0, 0, HEADER_HEIGHT),
			})}

			<scrollingframe
				Name="Body"
				Size={new UDim2(1, 0, 1, -BODY_OFFSET)}
				Position={new UDim2(0, 0, 0, BODY_OFFSET)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				CanvasSize={UDim2.fromScale(0, 0)}
				AutomaticCanvasSize={Enum.AutomaticSize.Y}
				ScrollingDirection={Enum.ScrollingDirection.Y}
				ScrollBarThickness={8}
				ScrollBarImageColor3={THEME.scrollbar}
			>
				<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
				<uipadding
					PaddingLeft={new UDim(0, 12)}
					PaddingRight={new UDim(0, 12)}
					PaddingTop={new UDim(0, 8)}
					PaddingBottom={new UDim(0, 8)}
				/>
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
		</frame>
	);
}
