import inspect from "@rbxts/inspect";
import Vide, { match, Show, values } from "@rbxts/vide";
import { ValueTree } from "app/components/value-tree";
import type { Action } from "atoms";
import { history } from "atoms/history";
import { type InspectorTab, inspectorTab, selectedActionId } from "atoms/inspector";
import { FONT, THEME } from "constants/theme";
import { formatTime } from "lib/format";
import { useAtom } from "@rbxts/vide-charm";

const HEADER_HEIGHT = 34;
const TAB_HEIGHT = 26;

function TabButton(props: { id: InspectorTab; label: string; active: () => InspectorTab; order: number }) {
	const isActive = () => props.active() === props.id;
	return (
		<textbutton
			Name={props.label}
			Size={new UDim2(0, 64, 1, 0)}
			BackgroundColor3={THEME.accent}
			BackgroundTransparency={() => (isActive() ? 0 : 1)}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Text={props.label}
			TextColor3={() => (isActive() ? THEME.text : THEME.textMuted)}
			TextSize={THEME.fontSize}
			Font={FONT.medium}
			LayoutOrder={props.order}
			Activated={() => inspectorTab(props.id)}
		>
			<uicorner CornerRadius={new UDim(0, 4)} />
		</textbutton>
	);
}

function InspectorContent(props: { action: Action }) {
	const tab = useAtom(inspectorTab);
	const action = props.action;

	return (
		<frame Name="Content" Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
			<frame Name="Header" Size={new UDim2(1, 0, 0, HEADER_HEIGHT)} BackgroundTransparency={1} BorderSizePixel={0}>
				<uipadding PaddingLeft={new UDim(0, 12)} PaddingRight={new UDim(0, 12)} />
				<textlabel
					Name="Name"
					AnchorPoint={new Vector2(0, 0.5)}
					Position={new UDim2(0, 0, 0.5, 0)}
					Size={new UDim2(1, -80, 0, HEADER_HEIGHT)}
					BackgroundTransparency={1}
					Text={action.name}
					TextColor3={THEME.text}
					TextSize={THEME.fontSize + 1}
					Font={FONT.bold}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextTruncate={Enum.TextTruncate.AtEnd}
				/>
				<textlabel
					Name="Time"
					AnchorPoint={new Vector2(1, 0.5)}
					Position={new UDim2(1, 0, 0.5, 0)}
					Size={UDim2.fromOffset(72, HEADER_HEIGHT)}
					BackgroundTransparency={1}
					Text={formatTime(action.timestamp)}
					TextColor3={THEME.textDim}
					TextSize={THEME.fontSize - 1}
					Font={FONT.mono}
					TextXAlignment={Enum.TextXAlignment.Right}
				/>
			</frame>

			<frame
				Name="Divider"
				Size={new UDim2(1, 0, 0, 1)}
				Position={new UDim2(0, 0, 0, HEADER_HEIGHT)}
				BackgroundColor3={THEME.divider}
				BorderSizePixel={0}
			/>

			<frame
				Name="Tabs"
				Size={new UDim2(1, 0, 0, TAB_HEIGHT)}
				Position={new UDim2(0, 0, 0, HEADER_HEIGHT + 1)}
				BackgroundTransparency={1}
			>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(0, 4)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>
				<uipadding PaddingLeft={new UDim(0, 12)} PaddingTop={new UDim(0, 2)} PaddingBottom={new UDim(0, 2)} />
				<TabButton id="tree" label="Tree" active={tab} order={1} />
				<TabButton id="raw" label="Raw" active={tab} order={2} />
			</frame>

			<scrollingframe
				Name="Body"
				Size={new UDim2(1, 0, 1, -(HEADER_HEIGHT + 1 + TAB_HEIGHT))}
				Position={new UDim2(0, 0, 0, HEADER_HEIGHT + 1 + TAB_HEIGHT)}
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
					raw: () => (
						<textlabel
							Name="Raw"
							AutomaticSize={Enum.AutomaticSize.Y}
							Size={new UDim2(1, 0, 0, 0)}
							BackgroundTransparency={1}
							Text={inspect(action.value, { depth: 6 })}
							TextColor3={THEME.tree.other}
							TextSize={THEME.monoSize}
							Font={FONT.mono}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Left}
							TextYAlignment={Enum.TextYAlignment.Top}
						/>
					),
				})}
			</scrollingframe>
		</frame>
	);
}

function EmptyState() {
	return (
		<textlabel
			Name="Empty"
			Size={UDim2.fromScale(1, 1)}
			BackgroundTransparency={1}
			Text="Select an action to inspect its payload"
			TextColor3={THEME.textDim}
			TextSize={THEME.fontSize}
			Font={FONT.ui}
		/>
	);
}

export function Inspector() {
	const selected = useAtom(selectedActionId);
	const historyState = useAtom(history);

	const selectedAction = () => {
		const id = selected();
		if (id === undefined) return undefined;
		return historyState().find((action) => action.id === id);
	};

	return (
		<frame Name="Inspector" Size={UDim2.fromScale(1, 1)} BackgroundColor3={THEME.windowBg} BorderSizePixel={0}>
			{values(
				() => {
					const action = selectedAction();
					return action !== undefined ? [action] : [];
				},
				(action) => (
					<InspectorContent action={action} />
				),
			)}
			<Show when={() => selectedAction() === undefined}>{() => <EmptyState />}</Show>
		</frame>
	);
}
