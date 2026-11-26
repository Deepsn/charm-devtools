import Vide, { cleanup, derive, effect, Show, source, untrack } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { IconButton, ToolbarButton } from "app/components/button";
import { Card } from "app/components/card";
import { CodeView } from "app/components/code-view";
import { InlineDiff, SplitDiff } from "app/components/diff-view";
import { EmptyState } from "app/components/empty-state";
import { VirtualizedList } from "app/components/virtualized-list";
import { createScrollControl } from "app/components/virtualized-list/scroll-control";
import { offset, px, udim, udim2 } from "app/hooks/use-px";
import type { Action } from "atoms";
import { atomLabels } from "atoms/atoms";
import { history } from "atoms/history";
import { selectedAtomId } from "atoms/inspector";
import {
	atomTimeline,
	clearAll,
	diffMode,
	findPrevious,
	type Timeline as TimelineState,
	timelineEnabled,
} from "atoms/timeline";
import { currentWindow } from "atoms/window";
import { FONT, THEME } from "constants/theme";
import { type DiffMode, diffValues, type ValueDiff } from "lib/diff";
import { envColor, formatTime, kindColor, previewValue, valueKind } from "lib/format";

const EMPTY_DIFF: ValueDiff = { inline: [], left: [], right: [], added: 0, removed: 0 };

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
			FontFace={FONT.mono}
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
					FontFace={FONT.medium}
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
					FontFace={FONT.bold}
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
					FontFace={FONT.medium}
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
	showEnv: () => boolean;
	onSelect: (entry: Action) => void;
}) {
	const hovered = source(false);
	const labels = useAtom(atomLabels);
	const labelOf = (name: string) => labels().get(name) ?? name;

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

			<frame
				Name="Env"
				AnchorPoint={new Vector2(0, 0.5)}
				Position={new UDim2(0, 3, 0.5, 0)}
				Size={offset(5, 5)}
				BackgroundColor3={() => envColor(props.entry().env)}
				BorderSizePixel={0}
				Visible={props.showEnv}
			>
				<uicorner CornerRadius={new UDim(1, 0)} />
			</frame>

			<textlabel
				Name="Time"
				Position={offset(10, 0)}
				Size={udim2(0, 60, 1, 0)}
				BackgroundTransparency={1}
				Text={() => formatTime(props.entry().timestamp)}
				TextColor3={THEME.textDim}
				TextSize={px(THEME.monoSize - 1)}
				FontFace={FONT.mono}
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
					return `${labelOf(entry.name)} <font color="#${THEME.textDim.ToHex()}">updated</font>`;
				}}
				TextColor3={() => {
					if (props.mode === "atom") return kindColor(valueKind(props.entry().value));
					return props.active() ? THEME.text : THEME.textMuted;
				}}
				TextSize={px(THEME.fontSize - 1)}
				FontFace={props.mode === "atom" ? FONT.mono : FONT.ui}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextTruncate={Enum.TextTruncate.AtEnd}
			/>
		</textbutton>
	);
}

const DIFF_MODES: readonly { mode: DiffMode; label: string; width: number }[] = [
	{ mode: "split", label: "Side by side", width: 96 },
	{ mode: "inline", label: "Inline", width: 58 },
	{ mode: "none", label: "None", width: 52 },
];

function DiffModePicker(props: { mode: () => DiffMode }) {
	return (
		<frame
			Name="DiffMode"
			AnchorPoint={new Vector2(1, 0)}
			Position={UDim2.fromScale(1, 0)}
			Size={UDim2.fromScale(0, 1)}
			AutomaticSize={Enum.AutomaticSize.X}
			BackgroundTransparency={1}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				Padding={udim(0, 4)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			{DIFF_MODES.map((option, index) => (
				<ToolbarButton
					name={option.label}
					text={option.label}
					width={option.width}
					active={() => props.mode() === option.mode}
					LayoutOrder={index}
					onClick={() => diffMode(option.mode)}
				/>
			))}
		</frame>
	);
}

const TOOLBAR_TOP = 30;
const TOOLBAR_HEIGHT = 24;
const VALUE_TOP = TOOLBAR_TOP + TOOLBAR_HEIGHT + 8;

function DiffCard(props: { entry: () => Action | undefined; mode: TimelineMode }) {
	const historyState = useAtom(history);
	const labels = useAtom(atomLabels);
	const mode = useAtom(diffMode);
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

	const diff = derive(() => {
		const entry = props.entry();
		if (entry === undefined || mode() === "none") return undefined;
		const prev = previous();
		return diffValues(prev?.value, entry.value, prev !== undefined);
	});

	const title = () => {
		if (previous() === undefined) return "Initial value";
		return mode() === "none" ? "Value" : "Changes";
	};

	const stats = () => {
		const current = diff();
		if (current === undefined) return "";
		const added = `<font color="#${THEME.diff.addedText.ToHex()}">+${current.added}</font>`;
		const removed = `<font color="#${THEME.diff.removedText.ToHex()}">−${current.removed}</font>`;
		return `${added}  ${removed}`;
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
								Text={() => {
									const name = props.entry()?.name;
									return name !== undefined ? (labels().get(name) ?? name) : "";
								}}
								TextColor3={THEME.text}
								TextSize={px(THEME.fontSize)}
								FontFace={FONT.medium}
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
								FontFace={FONT.mono}
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

						<frame
							Name="ValueToolbar"
							Position={offset(0, TOOLBAR_TOP)}
							Size={udim2(1, 0, 0, TOOLBAR_HEIGHT)}
							BackgroundTransparency={1}
						>
							<frame
								Name="Title"
								Size={UDim2.fromScale(0, 1)}
								AutomaticSize={Enum.AutomaticSize.X}
								BackgroundTransparency={1}
							>
								<uilistlayout
									FillDirection={Enum.FillDirection.Horizontal}
									VerticalAlignment={Enum.VerticalAlignment.Center}
									Padding={udim(0, 8)}
									SortOrder={Enum.SortOrder.LayoutOrder}
								/>
								<textlabel
									Name="Label"
									Size={UDim2.fromScale(0, 1)}
									AutomaticSize={Enum.AutomaticSize.X}
									BackgroundTransparency={1}
									Text={title}
									TextColor3={THEME.textMuted}
									TextSize={px(THEME.fontSize - 2)}
									FontFace={FONT.medium}
									LayoutOrder={0}
								/>
								<textlabel
									Name="Stats"
									Size={UDim2.fromScale(0, 1)}
									AutomaticSize={Enum.AutomaticSize.X}
									BackgroundTransparency={1}
									RichText={true}
									Text={stats}
									TextColor3={THEME.textMuted}
									TextSize={px(THEME.monoSize - 1)}
									FontFace={FONT.mono}
									LayoutOrder={1}
									Visible={() => stats() !== ""}
								/>
							</frame>
							<DiffModePicker mode={mode} />
						</frame>

						<Card
							name="Value"
							background={THEME.inputBg}
							Position={offset(0, VALUE_TOP)}
							Size={udim2(1, 0, 1, -VALUE_TOP)}
						>
							<frame Name="Clip" Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} ClipsDescendants={true}>
								<Show when={() => mode() === "none"}>{() => <CodeView value={() => props.entry()?.value} />}</Show>
								<Show when={() => mode() === "split"}>{() => <SplitDiff diff={() => diff() ?? EMPTY_DIFF} />}</Show>
								<Show when={() => mode() === "inline"}>{() => <InlineDiff diff={() => diff() ?? EMPTY_DIFF} />}</Show>
							</frame>
						</Card>
					</>
				)}
			</Show>
		</Card>
	);
}

export function Timeline(props: {
	timeline: TimelineState;
	mode: TimelineMode;
	/** Marks each entry with its environment, for timelines mixing client and server updates. */
	showEnv?: () => boolean;
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
								showEnv={props.showEnv ?? (() => props.mode === "global")}
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
