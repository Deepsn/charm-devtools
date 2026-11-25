import Vide, { derive, match, Show } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { ToolbarButton } from "app/components/button";
import { Card } from "app/components/card";
import { CodeView } from "app/components/code-view";
import { EmptyState } from "app/components/empty-state";
import { Icon } from "app/components/icon";
import { type Tab, TabStrip } from "app/components/tab-strip";
import { Timeline } from "app/components/timeline";
import { ValueTree } from "app/components/value-tree";
import { offset, px, udim, udim2 } from "app/hooks/use-px";
import { atoms } from "atoms/atoms";
import { selectedAtomId, type ValueView, valueView } from "atoms/inspector";
import { atomTimeline, timelineEnabled } from "atoms/timeline";
import { ICONS } from "constants/icons";
import { FONT, THEME } from "constants/theme";
import { describeType, formatTime, kindColor, splitAtomName, valueKind } from "lib/format";
import { openSource } from "lib/studio";

const HEADER_HEIGHT = 42;
const SECTION_GAP = THEME.gap / 2;
const VALUE_SHARE = 0.45;

const VIEW_TABS: readonly Tab<ValueView>[] = [
	{ id: "code", label: "Code" },
	{ id: "tree", label: "Tree" },
];

function AtStatus(props: { text: () => string; color: () => Color3 }) {
	return (
		<textlabel
			Name="At"
			Size={offset(0, 18)}
			AutomaticSize={Enum.AutomaticSize.X}
			BackgroundColor3={props.color}
			BackgroundTransparency={0.85}
			BorderSizePixel={0}
			Text={props.text}
			TextColor3={props.color}
			TextSize={px(THEME.fontSize - 2)}
			FontFace={FONT.mono}
			LayoutOrder={0}
		>
			<uicorner CornerRadius={udim(0, 4)} />
			<uipadding PaddingLeft={udim(0, 6)} PaddingRight={udim(0, 6)} />
		</textlabel>
	);
}

function AtomBadge(props: { color: () => Color3 }) {
	return (
		<frame Name="Badge" Size={UDim2.fromScale(1, 0.85)} BackgroundTransparency={1} LayoutOrder={0}>
			<uiaspectratioconstraint AspectRatio={1} DominantAxis={Enum.DominantAxis.Height} />
			<Icon
				image={ICONS.atom}
				color={props.color}
				scale={0.55}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Position={UDim2.fromScale(0.5, 0.5)}
			/>
		</frame>
	);
}

export function Inspector() {
	const atomsState = useAtom(atoms);
	const selected = useAtom(selectedAtomId);
	const enabled = useAtom(timelineEnabled);
	const paused = useAtom(atomTimeline.paused);
	const entry = useAtom(atomTimeline.active);
	const view = useAtom(valueView);

	const latest = derive(() => {
		const id = selected();
		return id !== undefined ? atomsState().find((action) => action.atomId === id) : undefined;
	});

	const timeline = () => enabled() && latest() !== undefined;

	const pinned = () => timeline() && paused();
	const shown = derive(() => (pinned() ? entry() : latest()));

	const value = () => shown()?.value;
	const kind = () => kindColor(valueKind(value()));

	return (
		<Card name="Inspector" padding={12}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={udim(0, SECTION_GAP)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>

			<Show when={() => latest() === undefined}>
				{() => (
					<frame Name="Placeholder" Size={UDim2.fromScale(1, 0)} BackgroundTransparency={1} LayoutOrder={0}>
						<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
						<EmptyState text="Select an atom to inspect its value" />
					</frame>
				)}
			</Show>

			<Show when={() => latest() !== undefined}>
				{() => (
					<>
						<frame Name="Header" Size={udim2(1, 0, 0, HEADER_HEIGHT)} BackgroundTransparency={1} LayoutOrder={1}>
							<uilistlayout
								FillDirection={Enum.FillDirection.Horizontal}
								VerticalAlignment={Enum.VerticalAlignment.Center}
								Padding={udim(0, 10)}
								SortOrder={Enum.SortOrder.LayoutOrder}
							/>

							<AtomBadge color={kind} />

							<frame Name="Titles" Size={UDim2.fromScale(0, 1)} BackgroundTransparency={1} LayoutOrder={1}>
								<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
								<uilistlayout
									FillDirection={Enum.FillDirection.Vertical}
									VerticalAlignment={Enum.VerticalAlignment.Center}
									Padding={udim(0, 2)}
									SortOrder={Enum.SortOrder.LayoutOrder}
								/>

								<textlabel
									Name="Title"
									Size={UDim2.fromScale(1, 0)}
									AutomaticSize={Enum.AutomaticSize.Y}
									BackgroundTransparency={1}
									Text={() => {
										const atom = latest();
										return atom !== undefined ? splitAtomName(atom.name).leaf : "";
									}}
									TextColor3={THEME.text}
									TextSize={px(THEME.fontSize + 3)}
									FontFace={FONT.bold}
									TextXAlignment={Enum.TextXAlignment.Left}
									TextTruncate={Enum.TextTruncate.AtEnd}
									LayoutOrder={0}
								/>

								<textlabel
									Name="Signature"
									Size={UDim2.fromScale(1, 0)}
									AutomaticSize={Enum.AutomaticSize.Y}
									BackgroundTransparency={1}
									Text={() => `atom<${describeType(value())}>`}
									TextColor3={THEME.textDim}
									TextSize={px(THEME.monoSize - 1)}
									FontFace={FONT.mono}
									TextXAlignment={Enum.TextXAlignment.Left}
									TextTruncate={Enum.TextTruncate.AtEnd}
									LayoutOrder={1}
								/>
							</frame>

							<frame
								Name="Meta"
								Size={UDim2.fromScale(0, 1)}
								AutomaticSize={Enum.AutomaticSize.X}
								BackgroundTransparency={1}
								LayoutOrder={2}
							>
								<uilistlayout
									FillDirection={Enum.FillDirection.Horizontal}
									VerticalAlignment={Enum.VerticalAlignment.Center}
									Padding={udim(0, 8)}
									SortOrder={Enum.SortOrder.LayoutOrder}
								/>
								<Show when={pinned}>
									{() => (
										<AtStatus
											text={() => {
												const at = entry();
												return at !== undefined ? `@ ${formatTime(at.timestamp)}` : "";
											}}
											color={() => THEME.kind.string}
										/>
									)}
								</Show>

								<Show when={() => latest()?.source !== undefined}>
									{() => (
										<frame
											Name="SourceSlot"
											Size={offset(0, THEME.tabHeight)}
											AutomaticSize={Enum.AutomaticSize.X}
											BackgroundTransparency={1}
											LayoutOrder={1}
										>
											<ToolbarButton
												name="OpenSource"
												text={"Open source"}
												onClick={() => {
													const source = latest()?.source;
													if (source !== undefined) openSource(source);
												}}
											/>
										</frame>
									)}
								</Show>

								<frame Name="TabSlot" Size={offset(132, THEME.tabHeight)} BackgroundTransparency={1} LayoutOrder={2}>
									{TabStrip<ValueView>({
										tabs: VIEW_TABS,
										active: view,
										onSelect: (id) => valueView(id),
									})}
								</frame>
							</frame>
						</frame>

						<frame
							Name="Divider"
							Size={udim2(1, 0, 0, 1)}
							BackgroundColor3={THEME.divider}
							BorderSizePixel={0}
							LayoutOrder={2}
						/>

						<frame
							Name="Value"
							Size={UDim2.fromScale(1, 0)}
							BackgroundColor3={THEME.valueBg}
							BorderSizePixel={0}
							ClipsDescendants={true}
							LayoutOrder={3}
						>
							<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
							<uicorner CornerRadius={udim(0, THEME.radius)} />
							<uistroke Color={THEME.border} />
							<uipadding
								PaddingTop={udim(0, SECTION_GAP)}
								PaddingBottom={udim(0, SECTION_GAP)}
								PaddingLeft={udim(0, SECTION_GAP)}
								PaddingRight={udim(0, SECTION_GAP)}
							/>
							<Show when={() => shown() === undefined}>
								{() => <EmptyState text="This atom had no value yet at this point" />}
							</Show>
							<Show when={() => shown() !== undefined}>
								{() =>
									match(view)({
										code: () => <CodeView value={value} />,
										tree: () => (
											<scrollingframe
												Name="TreeScroll"
												Size={UDim2.fromScale(1, 1)}
												BackgroundTransparency={1}
												BorderSizePixel={0}
												CanvasSize={UDim2.fromScale(0, 0)}
												AutomaticCanvasSize={Enum.AutomaticSize.Y}
												ScrollingDirection={Enum.ScrollingDirection.Y}
												ScrollBarThickness={px(6)}
												ScrollBarImageColor3={THEME.scrollbar}
											>
												<uipadding PaddingTop={udim(0, 6)} PaddingLeft={udim(0, 8)} />
												<ValueTree value={value} scope={() => latest()?.atomId ?? "root"} />
											</scrollingframe>
										),
									})
								}
							</Show>
						</frame>
					</>
				)}
			</Show>

			<Show when={timeline}>
				{() => (
					<frame
						Name="TimelineSlot"
						Size={UDim2.fromScale(1, 1 - VALUE_SHARE)}
						BackgroundTransparency={1}
						LayoutOrder={4}
					>
						<uipadding PaddingTop={udim(0, SECTION_GAP)} />
						<Timeline timeline={atomTimeline} mode="atom" />
					</frame>
				)}
			</Show>
		</Card>
	);
}
