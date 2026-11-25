import Vide, { cleanup, type Derivable, derive, effect, Show, source, untrack } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { IconButton, ToolbarButton } from "app/components/button";
import { Card } from "app/components/card";
import { CodeView } from "app/components/code-view";
import { EmptyState } from "app/components/empty-state";
import { VirtualizedList } from "app/components/virtualized-list";
import { createScrollControl } from "app/components/virtualized-list/scroll-control";
import { offset, px, udim, udim2 } from "app/hooks/use-px";
import type { Action } from "atoms";
import { history } from "atoms/history";
import { selectedAtomId } from "atoms/inspector";
import { atomTimeline, clearAll, findPrevious, type Timeline as TimelineState, timelineEnabled } from "atoms/timeline";
import { currentWindow } from "atoms/window";
import { FONT, THEME } from "constants/theme";
import { changedKeys, formatTime, kindColor, previewValue, valueKind } from "lib/format";

export type TimelineMode = "atom" | "global";

const HEADER_HEIGHT = 28;
const ROW_HEIGHT = 26;
const CONTROL_SIZE = 26;

type Glyph = "prev" | "next" | "pause" | "play";

function Bar(props: { order: number; color: () => Color3; width?: number }) {
	return (
		<frame
			Size={offset(props.width ?? 2, 10)}
			BackgroundColor3={props.color}
			BorderSizePixel={0}
			LayoutOrder={props.order}
		/>
	);
}

function Triangle(props: { text: string; order: number; color: () => Color3 }) {
	return (
		<textlabel
			Size={offset(8, 12)}
			BackgroundTransparency={1}
			Text={props.text}
			TextColor3={props.color}
			TextSize={px(10)}
			Font={FONT.mono}
			LayoutOrder={props.order}
		/>
	);
}

function PlaybackGlyph(props: { glyph: () => Glyph; color: () => Color3 }) {
	return (
		<frame Name="Glyph" Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				Padding={udim(0, 2)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<Show when={() => props.glyph() === "prev"}>
				{() => (
					<>
						<Bar order={0} color={props.color} />
						<Triangle text="◀" order={1} color={props.color} />
					</>
				)}
			</Show>
			<Show when={() => props.glyph() === "next"}>
				{() => (
					<>
						<Triangle text="▶" order={0} color={props.color} />
						<Bar order={1} color={props.color} />
					</>
				)}
			</Show>
			<Show when={() => props.glyph() === "pause"}>
				{() => (
					<>
						<Bar order={0} width={3} color={props.color} />
						<frame Size={offset(1, 1)} BackgroundTransparency={1} LayoutOrder={1} />
						<Bar order={2} width={3} color={props.color} />
					</>
				)}
			</Show>
			<Show when={() => props.glyph() === "play"}>{() => <Triangle text="▶" order={0} color={props.color} />}</Show>
		</frame>
	);
}

function TimelineHeader(props: { timeline: TimelineState; title: string; count: () => number; live: () => boolean }) {
	return (
		<frame Name="Header" Size={udim2(1, 0, 0, HEADER_HEIGHT)} BackgroundTransparency={1}>
			<frame Name="Title" Size={UDim2.fromScale(0.6, 1)} BackgroundTransparency={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					Padding={udim(0, 8)}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>
				<imagelabel
					Name="Icon"
					Size={offset(16, 16)}
					BackgroundTransparency={1}
					ImageColor3={THEME.text}
					LayoutOrder={0}
				/>
				<textlabel
					Name="Label"
					Size={UDim2.fromScale(0, 1)}
					AutomaticSize={Enum.AutomaticSize.X}
					BackgroundTransparency={1}
					Text={props.title}
					TextColor3={THEME.text}
					TextSize={px(THEME.fontSize + 1)}
					Font={FONT.medium}
					LayoutOrder={1}
				/>
				<textlabel
					Name="Count"
					Size={UDim2.fromScale(0, 1)}
					AutomaticSize={Enum.AutomaticSize.X}
					BackgroundTransparency={1}
					Text={() => `${props.count()} ${props.count() === 1 ? "update" : "updates"}`}
					TextColor3={THEME.textMuted}
					TextSize={px(THEME.fontSize)}
					Font={FONT.bold}
					LayoutOrder={2}
				/>
			</frame>

			<frame
				Name="Controls"
				AnchorPoint={new Vector2(1, 0.5)}
				Position={UDim2.fromScale(1, 0.5)}
				Size={offset(0, CONTROL_SIZE)}
				AutomaticSize={Enum.AutomaticSize.X}
				BackgroundTransparency={1}
			>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					Padding={udim(0, 4)}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>

				<textbutton
					Name="Clear"
					Size={offset(0, CONTROL_SIZE)}
					AutomaticSize={Enum.AutomaticSize.X}
					BackgroundTransparency={1}
					Text="Clear"
					TextColor3={THEME.textMuted}
					TextSize={px(THEME.fontSize - 1)}
					Font={FONT.medium}
					LayoutOrder={0}
					Activated={clearAll}
				>
					<uipadding PaddingLeft={udim(0, 6)} PaddingRight={udim(0, 8)} />
				</textbutton>

				<IconButton name="StepBack" LayoutOrder={1} onClick={() => props.timeline.step("older")}>
					<PlaybackGlyph glyph={() => "prev"} color={() => THEME.textMuted} />
				</IconButton>
				<IconButton
					name="PlayPause"
					primary={() => !props.live()}
					LayoutOrder={2}
					onClick={() => props.timeline.toggleLive()}
				>
					<PlaybackGlyph
						glyph={() => (props.live() ? "pause" : "play")}
						color={() => (props.live() ? THEME.textMuted : Color3.fromRGB(255, 255, 255))}
					/>
				</IconButton>
				<IconButton name="StepForward" LayoutOrder={3} onClick={() => props.timeline.step("newer")}>
					<PlaybackGlyph glyph={() => "next"} color={() => THEME.textMuted} />
				</IconButton>
			</frame>
		</frame>
	);
}

function EntryRow(props: {
	entry: () => Action;
	active: () => boolean;
	mode: TimelineMode;
	onSelect: (entry: Action) => void;
}) {
	const hovered = source(false);

	return (
		<textbutton
			Name="Entry"
			Size={UDim2.fromScale(1, 1)}
			BackgroundColor3={() => (props.active() ? THEME.rowSelected : THEME.rowHover)}
			BackgroundTransparency={() => (props.active() ? 0 : hovered() ? 0.3 : 1)}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Text=""
			Activated={() => props.onSelect(props.entry())}
			MouseEnter={() => hovered(true)}
			MouseLeave={() => hovered(false)}
		>
			<uicorner CornerRadius={udim(0, 4)} />

			<textlabel
				Name="Time"
				Position={offset(10, 0)}
				Size={udim2(0, 60, 1, 0)}
				BackgroundTransparency={1}
				Text={() => formatTime(props.entry().timestamp)}
				TextColor3={THEME.textDim}
				TextSize={px(THEME.monoSize - 1)}
				Font={FONT.mono}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>

			<textlabel
				Name="Label"
				Position={offset(80, 0)}
				Size={udim2(1, -88, 1, 0)}
				BackgroundTransparency={1}
				RichText={props.mode === "global"}
				Text={() => {
					const entry = props.entry();
					if (props.mode === "atom") return previewValue(entry.value);
					return `${entry.name} <font color="#${THEME.textDim.ToHex()}">updated</font>`;
				}}
				TextColor3={() => {
					if (props.mode === "atom") return kindColor(valueKind(props.entry().value));
					return props.active() ? THEME.text : THEME.textMuted;
				}}
				TextSize={px(THEME.fontSize - 1)}
				Font={props.mode === "atom" ? FONT.mono : FONT.ui}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextTruncate={Enum.TextTruncate.AtEnd}
			/>
		</textbutton>
	);
}

function ValueColumn(props: {
	title: string;
	text: () => string;
	color: Color3;
	position: Derivable<UDim2>;
	order: number;
}) {
	return (
		<frame
			Name={props.title}
			Position={props.position}
			Size={udim2(0.5, -4, 0, 0)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			LayoutOrder={props.order}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={udim(0, 6)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<textlabel
				Name="Title"
				Size={udim2(1, 0, 0, 14)}
				BackgroundTransparency={1}
				Text={props.title}
				TextColor3={THEME.textMuted}
				TextSize={px(THEME.fontSize - 2)}
				Font={FONT.medium}
				TextXAlignment={Enum.TextXAlignment.Left}
				LayoutOrder={0}
			/>
			<frame
				Name="Chip"
				Size={UDim2.fromScale(1, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				BackgroundColor3={THEME.inputBg}
				BorderSizePixel={0}
				LayoutOrder={1}
			>
				<uicorner CornerRadius={udim(0, 4)} />
				<uistroke Color={THEME.border} />
				<uipadding
					PaddingLeft={udim(0, 8)}
					PaddingRight={udim(0, 8)}
					PaddingTop={udim(0, 6)}
					PaddingBottom={udim(0, 6)}
				/>
				<textlabel
					Name="Value"
					Size={UDim2.fromScale(1, 0)}
					AutomaticSize={Enum.AutomaticSize.Y}
					BackgroundTransparency={1}
					Text={props.text}
					TextColor3={props.color}
					TextSize={px(THEME.monoSize - 1)}
					Font={FONT.mono}
					TextWrapped={true}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextYAlignment={Enum.TextYAlignment.Top}
				/>
			</frame>
		</frame>
	);
}

const PREVIEW_HEIGHT = 104;
const VALUE_TOP = 30 + PREVIEW_HEIGHT + 10;

function DiffCard(props: { entry: () => Action | undefined; mode: TimelineMode }) {
	const historyState = useAtom(history);
	const global = props.mode === "global";

	const inspect = () => {
		const entry = props.entry();
		if (entry === undefined) return;
		selectedAtomId(entry.atomId);
		timelineEnabled(true);
		atomTimeline.cursor(entry.id);
		currentWindow("state");
	};

	const previous = derive(() => {
		const entry = props.entry();
		return entry !== undefined ? findPrevious(historyState(), entry) : undefined;
	});

	const changed = () => {
		const entry = props.entry();
		const prev = previous();
		if (entry === undefined || prev === undefined) return "";
		const keys = changedKeys(prev.value, entry.value);
		return keys.isEmpty() ? "" : `Changed: ${keys.join(", ")}`;
	};

	return (
		<Card name="Diff" background={THEME.cardBg} padding={10} Size={udim2(0.5, -4, 1, 0)} Position={udim2(0.5, 4, 0, 0)}>
			<Show when={() => props.entry() === undefined}>{() => <EmptyState text="No updates recorded yet" />}</Show>

			<Show when={() => props.entry() !== undefined}>
				{() => (
					<>
						<frame Name="Header" Size={udim2(1, 0, 0, 20)} BackgroundTransparency={1}>
							<textlabel
								Name="Name"
								Position={offset(20, 0)}
								Size={udim2(1, global ? -180 : -100, 1, 0)}
								BackgroundTransparency={1}
								Text={() => props.entry()?.name ?? ""}
								TextColor3={THEME.text}
								TextSize={px(THEME.fontSize)}
								Font={FONT.medium}
								TextXAlignment={Enum.TextXAlignment.Left}
								TextTruncate={Enum.TextTruncate.AtEnd}
							/>
							<textlabel
								Name="Time"
								AnchorPoint={new Vector2(1, 0)}
								Position={UDim2.fromScale(1, 0)}
								Size={udim2(0, 76, 1, 0)}
								BackgroundTransparency={1}
								Text={() => {
									const entry = props.entry();
									return entry !== undefined ? formatTime(entry.timestamp) : "";
								}}
								TextColor3={THEME.textDim}
								TextSize={px(THEME.monoSize - 1)}
								Font={FONT.mono}
								TextXAlignment={Enum.TextXAlignment.Right}
							/>
							{global ? (
								<frame
									Name="InspectSlot"
									AnchorPoint={new Vector2(1, 0)}
									Position={udim2(1, -84, 0, -2)}
									Size={offset(74, 24)}
									BackgroundTransparency={1}
								>
									<ToolbarButton name="Inspect" text="Inspect" width={74} onClick={inspect} />
								</frame>
							) : undefined}
						</frame>

						<scrollingframe
							Name="Body"
							Position={offset(0, 30)}
							Size={global ? udim2(1, 0, 0, PREVIEW_HEIGHT) : udim2(1, 0, 1, -30)}
							BackgroundTransparency={1}
							BorderSizePixel={0}
							CanvasSize={UDim2.fromScale(0, 0)}
							AutomaticCanvasSize={Enum.AutomaticSize.Y}
							ScrollingDirection={Enum.ScrollingDirection.Y}
							ScrollBarThickness={px(4)}
							ScrollBarImageColor3={THEME.scrollbar}
						>
							<frame
								Name="Columns"
								Size={UDim2.fromScale(1, 0)}
								AutomaticSize={Enum.AutomaticSize.Y}
								BackgroundTransparency={1}
							>
								<ValueColumn
									title="Previous"
									text={() => {
										const prev = previous();
										return prev !== undefined ? previewValue(prev.value) : "— initial value";
									}}
									color={THEME.tree.boolean}
									position={UDim2.fromScale(0, 0)}
									order={0}
								/>
								<ValueColumn
									title="Current"
									text={() => previewValue(props.entry()?.value)}
									color={THEME.tree.string}
									position={udim2(0.5, 4, 0, 0)}
									order={1}
								/>
							</frame>

							<textlabel
								Name="Changed"
								Size={UDim2.fromScale(1, 0)}
								AutomaticSize={Enum.AutomaticSize.Y}
								BackgroundTransparency={1}
								Text={changed}
								TextColor3={THEME.textDim}
								TextSize={px(THEME.fontSize - 2)}
								Font={FONT.ui}
								TextWrapped={true}
								TextXAlignment={Enum.TextXAlignment.Left}
								LayoutOrder={1}
								Visible={() => changed() !== ""}
							/>
							<uilistlayout
								FillDirection={Enum.FillDirection.Vertical}
								Padding={udim(0, 10)}
								SortOrder={Enum.SortOrder.LayoutOrder}
							/>
						</scrollingframe>

						{global ? (
							<>
								<textlabel
									Name="ValueTitle"
									Position={offset(0, VALUE_TOP)}
									Size={udim2(1, 0, 0, 14)}
									BackgroundTransparency={1}
									Text="Value"
									TextColor3={THEME.textMuted}
									TextSize={px(THEME.fontSize - 2)}
									Font={FONT.medium}
									TextXAlignment={Enum.TextXAlignment.Left}
								/>
								<Card
									name="Value"
									background={THEME.inputBg}
									Position={offset(0, VALUE_TOP + 20)}
									Size={udim2(1, 0, 1, -(VALUE_TOP + 20))}
								>
									<CodeView value={() => props.entry()?.value} />
								</Card>
							</>
						) : undefined}
					</>
				)}
			</Show>
		</Card>
	);
}

export function Timeline(props: {
	timeline: TimelineState;
	mode: TimelineMode;
	Size?: () => UDim2;
	Position?: () => UDim2;
}) {
	const entries = useAtom(props.timeline.entries);
	const active = useAtom(props.timeline.active);
	const paused = useAtom(props.timeline.paused);
	const scrollControl = createScrollControl();

	const live = () => !paused();
	const emptyText = props.mode === "atom" ? "No updates for this atom yet" : "Waiting for updates...";

	const activeId = derive(() => active()?.id);

	effect(() => {
		const id = activeId();

		const thread = task.defer(() => {
			untrack(() => {
				const frame = scrollControl.getScrollingFrame();
				if (frame === undefined || id === undefined) return;

				const index = entries().findIndex((entry) => entry.id === id);
				if (index < 0) return;

				const rowHeight = px(ROW_HEIGHT)();
				const top = index * rowHeight;
				const bottom = top + rowHeight;
				const viewTop = frame.CanvasPosition.Y;
				const viewHeight = frame.AbsoluteWindowSize.Y;

				if (top < viewTop) {
					frame.CanvasPosition = new Vector2(0, top);
				} else if (bottom > viewTop + viewHeight) {
					frame.CanvasPosition = new Vector2(0, bottom - viewHeight);
				}
			});
		});
		cleanup(thread);
	});

	return (
		<frame
			Name="Timeline"
			Size={props.Size ?? UDim2.fromScale(1, 1)}
			Position={props.Position ?? UDim2.fromScale(0, 0)}
			BackgroundTransparency={1}
		>
			<TimelineHeader
				timeline={props.timeline}
				title={props.mode === "atom" ? "Timeline" : "All updates"}
				count={() => entries().size()}
				live={live}
			/>

			<frame
				Name="Body"
				Position={offset(0, HEADER_HEIGHT + THEME.gap)}
				Size={udim2(1, 0, 1, -(HEADER_HEIGHT + THEME.gap))}
				BackgroundTransparency={1}
			>
				<Card name="Entries" background={THEME.cardBg} padding={4} Size={udim2(0.5, -4, 1, 0)}>
					<Show when={() => entries().isEmpty()}>{() => <EmptyState text={emptyText} />}</Show>
					<VirtualizedList
						items={entries}
						rowHeight={ROW_HEIGHT}
						ScrollBarThickness={4}
						ScrollBarImageColor3={THEME.scrollbar}
						scrollControl={scrollControl}
						render={(entry) => (
							<EntryRow
								entry={entry}
								mode={props.mode}
								active={() => active()?.id === entry().id}
								onSelect={(selected) => props.timeline.select(selected)}
							/>
						)}
					/>
				</Card>

				<DiffCard entry={active} mode={props.mode} />
			</frame>
		</frame>
	);
}
