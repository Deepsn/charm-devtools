import Vide, { derive, match, Show } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { ToolbarButton } from "app/components/button";
import { Card } from "app/components/card";
import { CodeView } from "app/components/code-view";
import { EmptyState } from "app/components/empty-state";
import { Icon } from "app/components/icon";
import { Timeline } from "app/components/timeline";
import { ValueTree } from "app/components/value-tree";
import { type WindowTab, WindowTabs } from "app/components/window-tabs";
import { offset, px, udim, udim2 } from "app/hooks/use-px";
import { DependentsView } from "app/layout/state/dependents";
import type { Action } from "atoms";
import { atoms, selectedIsMerged, selectedPair, shownAtomIds, shownEnvs } from "atoms/atoms";
import { dependents } from "atoms/dependents";
import { type EnvView, envView, type InspectorWindow, inspectorWindow, selectedAtomId } from "atoms/inspector";
import { atomTimeline, timelineEnabled, valueAt } from "atoms/timeline";
import { ICONS } from "constants/icons";
import { FONT, THEME } from "constants/theme";
import { describeType, envColor, formatTime, kindColor, splitAtomName, valueKind } from "lib/format";
import { openSource } from "lib/studio";

const HEADER_HEIGHT = 42;
const SECTION_GAP = THEME.gap / 2;
const VALUE_SHARE = 0.45;

type Env = Action["env"];

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

const ENV_VIEWS: readonly { id: EnvView; label: string }[] = [
	{ id: "both", label: "Both" },
	{ id: "client", label: "Client" },
	{ id: "server", label: "Server" },
];

const ENVS: readonly Env[] = ["client", "server"];

const PANE_HEADER_HEIGHT = 20;

function EnvSelector(props: { LayoutOrder: number }) {
	const view = useAtom(envView);

	return (
		<frame
			Name="EnvView"
			Size={offset(0, THEME.tabHeight)}
			AutomaticSize={Enum.AutomaticSize.X}
			BackgroundTransparency={1}
			LayoutOrder={props.LayoutOrder}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				Padding={udim(0, 4)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			{ENV_VIEWS.map((option, index) => (
				<ToolbarButton
					name={option.label}
					text={option.label}
					active={() => view() === option.id}
					LayoutOrder={index}
					onClick={() => envView(option.id)}
				/>
			))}
		</frame>
	);
}

function EnvPane(props: { env: Env; order: number; children: Vide.Node }) {
	return (
		<frame
			Name={props.env}
			Size={udim2(0.5, -SECTION_GAP / 2, 1, 0)}
			BackgroundTransparency={1}
			LayoutOrder={props.order}
		>
			<textlabel
				Name="Env"
				Size={udim2(1, 0, 0, PANE_HEADER_HEIGHT)}
				BackgroundTransparency={1}
				Text={props.env.upper()}
				TextColor3={envColor(props.env)}
				TextSize={px(THEME.labelSize)}
				FontFace={FONT.medium}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uipadding PaddingLeft={udim(0, 8)} />
			</textlabel>
			<frame
				Name="Content"
				Position={offset(0, PANE_HEADER_HEIGHT)}
				Size={udim2(1, 0, 1, -PANE_HEADER_HEIGHT)}
				BackgroundTransparency={1}
				ClipsDescendants={true}
			>
				{props.children}
			</frame>
		</frame>
	);
}

/** Renders a window once per shown environment, side by side when both are shown. */
function EnvPanes(props: { envs: () => readonly Env[]; children: (env: () => Env) => Vide.Node }) {
	const split = () => props.envs().size() > 1;

	return (
		<>
			<Show when={() => !split()}>{() => props.children(() => props.envs()[0] ?? "client")}</Show>
			<Show when={split}>
				{() => (
					<frame Name="Split" Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
						<uilistlayout
							FillDirection={Enum.FillDirection.Horizontal}
							Padding={udim(0, SECTION_GAP)}
							SortOrder={Enum.SortOrder.LayoutOrder}
						/>
						{ENVS.map((env, index) => (
							<EnvPane env={env} order={index}>
								{props.children(() => env)}
							</EnvPane>
						))}
					</frame>
				)}
			</Show>
		</>
	);
}

function ValueWindow(props: { shown: () => unknown; children: () => Vide.Node }) {
	return (
		<>
			<Show when={() => props.shown() === undefined}>
				{() => <EmptyState text="This atom had no value yet at this point" />}
			</Show>
			<Show when={() => props.shown() !== undefined}>{props.children}</Show>
		</>
	);
}

export function Inspector() {
	const atomsState = useAtom(atoms);
	const selected = useAtom(selectedAtomId);
	const enabled = useAtom(timelineEnabled);
	const paused = useAtom(atomTimeline.paused);
	const entry = useAtom(atomTimeline.active);
	const activeWindow = useAtom(inspectorWindow);
	const graph = useAtom(dependents);
	const pair = useAtom(selectedPair);
	const merged = useAtom(selectedIsMerged);
	const envs = useAtom(shownEnvs);
	const ids = useAtom(shownAtomIds);
	const entries = useAtom(atomTimeline.entries);

	const latest = derive(() => {
		const id = selected();
		return id !== undefined ? atomsState().find((action) => action.atomId === id) : undefined;
	});

	const dependentCount = () => {
		let count = 0;
		for (const id of ids()) count += graph().get(id)?.dependents.size() ?? 0;
		return count > 0 ? tostring(count) : undefined;
	};

	const windows: readonly WindowTab<InspectorWindow>[] = [
		{ id: "code", label: "Code" },
		{ id: "tree", label: "Tree" },
		{ id: "dependents", label: "Dependents", badge: dependentCount },
	];

	const timeline = () => enabled() && latest() !== undefined;

	const pinned = () => timeline() && paused();

	/** Update of `env` shown in the inspector: the one at the pinned timeline entry, or the latest. */
	const shownFor = (env: Env) => {
		const current = pair()?.[env];
		if (current === undefined) return undefined;
		return valueAt(entries(), current.atomId, current, pinned() ? entry() : undefined);
	};

	const shown = derive(() => {
		const env = envs()[0];
		return env !== undefined ? shownFor(env) : undefined;
	});

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

								<Show when={merged}>{() => <EnvSelector LayoutOrder={1} />}</Show>

								<Show when={() => latest()?.source !== undefined}>
									{() => (
										<frame
											Name="SourceSlot"
											Size={offset(0, THEME.tabHeight)}
											AutomaticSize={Enum.AutomaticSize.X}
											BackgroundTransparency={1}
											LayoutOrder={2}
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
							</frame>
						</frame>

						<WindowTabs<InspectorWindow>
							name="Windows"
							tabs={windows}
							active={activeWindow}
							onSelect={(id) => inspectorWindow(id)}
							padding={SECTION_GAP}
							LayoutOrder={3}
						>
							{match(activeWindow)({
								code: () => (
									<EnvPanes envs={envs}>
										{(env) => {
											const action = () => shownFor(env());
											return (
												<ValueWindow shown={action}>{() => <CodeView value={() => action()?.value} />}</ValueWindow>
											);
										}}
									</EnvPanes>
								),
								tree: () => (
									<EnvPanes envs={envs}>
										{(env) => {
											const action = () => shownFor(env());
											return (
												<ValueWindow shown={action}>
													{() => (
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
															<ValueTree
																value={() => action()?.value}
																scope={() => pair()?.[env()]?.atomId ?? "root"}
															/>
														</scrollingframe>
													)}
												</ValueWindow>
											);
										}}
									</EnvPanes>
								),
								dependents: () => (
									<EnvPanes envs={envs}>{(env) => <DependentsView atomId={() => pair()?.[env()]?.atomId} />}</EnvPanes>
								),
							})}
						</WindowTabs>
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
						<Timeline timeline={atomTimeline} mode="atom" showEnv={() => envs().size() > 1} />
					</frame>
				)}
			</Show>
		</Card>
	);
}
