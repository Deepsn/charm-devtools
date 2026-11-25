import type { Atom } from "@rbxts/charm";
import Vide, { source } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { ToolbarButton } from "app/components/button";
import { Icon } from "app/components/icon";
import { Popover, PopoverItem, PopoverTitle } from "app/components/popover";
import { offset, px, udim, udim2 } from "app/hooks/use-px";
import {
	atomSearch,
	type EnvScope,
	envScope,
	kindFilter,
	type SortMode,
	sortMode,
	toggleKindFilter,
} from "atoms/inspector";
import { timelineEnabled, toggleTimeline } from "atoms/timeline";
import { ICONS } from "constants/icons";
import { FONT, THEME } from "constants/theme";
import { envColor, kindColor, VALUE_KINDS, type ValueKind } from "lib/format";

const ENV_OPTIONS: readonly { id: EnvScope; label: string }[] = [
	{ id: "all", label: "All environments" },
	{ id: "server", label: "Server" },
	{ id: "client", label: "LocalPlayer" },
];

const SORT_OPTIONS: readonly { id: SortMode; label: string; short: string }[] = [
	{ id: "name", label: "Name (A–Z)", short: "A–Z" },
	{ id: "recent", label: "Recently changed", short: "Recent" },
];

const KIND_LABELS: Record<ValueKind, string> = {
	table: "Tables",
	boolean: "Booleans",
	number: "Numbers",
	string: "Strings",
	other: "Other",
};

const ENV_WIDTH = 160;
const FILTER_WIDTH = 78;
const SORT_WIDTH = 104;

function scopeColor(scope: EnvScope) {
	return scope === "all" ? THEME.accent : envColor(scope);
}

export function EnvDropdown() {
	const scope = useAtom(envScope);
	const open = source(false);
	const hovered = source(false);

	const label = () => ENV_OPTIONS.find((option) => option.id === scope())?.label ?? "";

	return (
		<textbutton
			Name="EnvDropdown"
			Size={udim2(0, ENV_WIDTH, 1, 0)}
			BackgroundColor3={() => (hovered() || open() ? THEME.rowHover : THEME.cardBg)}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Text=""
			ZIndex={() => (open() ? 5 : 1)}
			LayoutOrder={0}
			Activated={() => open(!open())}
			MouseEnter={() => hovered(true)}
			MouseLeave={() => hovered(false)}
		>
			<uicorner CornerRadius={udim(0, THEME.radius)} />
			<uistroke Color={THEME.border} />
			<uipadding PaddingLeft={udim(0, 12)} PaddingRight={udim(0, 12)} />

			<frame
				Name="Dot"
				AnchorPoint={new Vector2(0, 0.5)}
				Position={UDim2.fromScale(0, 0.5)}
				Size={offset(8, 8)}
				BackgroundColor3={() => scopeColor(scope())}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(1, 0)} />
			</frame>

			<textlabel
				Name="Label"
				Position={offset(16, 0)}
				Size={udim2(1, -30, 1, 0)}
				BackgroundTransparency={1}
				Text={label}
				TextColor3={THEME.text}
				TextSize={px(THEME.fontSize)}
				Font={FONT.bold}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextTruncate={Enum.TextTruncate.AtEnd}
			/>

			<textlabel
				Name="Chevron"
				AnchorPoint={new Vector2(1, 0)}
				Position={UDim2.fromScale(1, 0)}
				Size={udim2(0, 12, 1, 0)}
				BackgroundTransparency={1}
				Text={() => (open() ? "▲" : "▼")}
				TextColor3={THEME.textMuted}
				TextSize={px(9)}
				Font={FONT.mono}
			/>

			<Popover open={open} onClose={() => open(false)} width={ENV_WIDTH} inset={12}>
				<PopoverTitle text="Environment" />
				{ENV_OPTIONS.map((option, index) => (
					<PopoverItem
						text={option.label}
						color={scopeColor(option.id)}
						checked={() => scope() === option.id}
						LayoutOrder={index + 1}
						onClick={() => {
							envScope(option.id);
							open(false);
						}}
					/>
				))}
			</Popover>
		</textbutton>
	);
}

export function SearchBox(props: { search: Atom<string>; placeholder: string }) {
	const search = useAtom(props.search);
	const focused = source(false);

	return (
		<frame
			Name="Search"
			Size={UDim2.fromScale(0, 1)}
			BackgroundColor3={THEME.inputBg}
			BorderSizePixel={0}
			LayoutOrder={1}
		>
			<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
			<uicorner CornerRadius={udim(0, THEME.radius)} />
			<uistroke Color={() => (focused() ? THEME.accent : THEME.border)} />
			<uipadding PaddingLeft={udim(0, 12)} PaddingRight={udim(0, 8)} />

			<Icon image={ICONS.search} Position={UDim2.fromScale(0, 0.5)} Size={20} AnchorPoint={new Vector2(0, 0.5)} />

			<textbox
				Name="Input"
				Position={offset(24, 0)}
				Size={udim2(1, -48, 1, 0)}
				BackgroundTransparency={1}
				Text={search}
				PlaceholderText={props.placeholder}
				PlaceholderColor3={THEME.textDim}
				TextColor3={THEME.text}
				TextSize={px(THEME.fontSize)}
				Font={FONT.medium}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextTruncate={Enum.TextTruncate.AtEnd}
				ClearTextOnFocus={false}
				TextChanged={(text: string) => props.search(text)}
				Focused={() => focused(true)}
				FocusLost={() => focused(false)}
			/>

			<textbutton
				Name="Clear"
				AnchorPoint={new Vector2(1, 0.5)}
				Position={UDim2.fromScale(1, 0.5)}
				Size={offset(18, 18)}
				BackgroundTransparency={1}
				Text="×"
				TextColor3={THEME.textMuted}
				TextSize={px(THEME.fontSize + 3)}
				Font={FONT.medium}
				Visible={() => search() !== ""}
				Activated={() => props.search("")}
			/>
		</frame>
	);
}

function SortButton() {
	const sort = useAtom(sortMode);
	const open = source(false);

	const label = () => SORT_OPTIONS.find((option) => option.id === sort())?.short ?? "";

	return (
		<ToolbarButton
			name="Sort"
			text={() => `Sort: ${label()}`}
			active={open}
			width={SORT_WIDTH}
			ZIndex={() => (open() ? 5 : 1)}
			LayoutOrder={3}
			onClick={() => open(!open())}
		>
			<Popover open={open} onClose={() => open(false)} width={170} align="right">
				<PopoverTitle text="Sort by" />
				{SORT_OPTIONS.map((option, index) => (
					<PopoverItem
						text={option.label}
						checked={() => sort() === option.id}
						LayoutOrder={index + 1}
						onClick={() => {
							sortMode(option.id);
							open(false);
						}}
					/>
				))}
			</Popover>
		</ToolbarButton>
	);
}

function FilterButton() {
	const kinds = useAtom(kindFilter);
	const open = source(false);

	const hidden = () => VALUE_KINDS.filter((kind) => !kinds()[kind]).size();

	return (
		<ToolbarButton
			name="Filter"
			text={() => (hidden() > 0 ? `Filter · ${VALUE_KINDS.size() - hidden()}` : "Filter")}
			active={() => open() || hidden() > 0}
			width={FILTER_WIDTH}
			ZIndex={() => (open() ? 5 : 1)}
			LayoutOrder={4}
			onClick={() => open(!open())}
		>
			<Popover open={open} onClose={() => open(false)} width={170} align="right">
				<PopoverTitle text="Value type" />
				{VALUE_KINDS.map((kind, index) => (
					<PopoverItem
						text={KIND_LABELS[kind]}
						color={kindColor(kind)}
						checked={() => kinds()[kind]}
						LayoutOrder={index + 1}
						onClick={() => toggleKindFilter(kind)}
					/>
				))}
			</Popover>
		</ToolbarButton>
	);
}

export function Toolbar() {
	const timeline = useAtom(timelineEnabled);

	return (
		<frame Name="Toolbar" Size={udim2(1, 0, 0, THEME.filterHeight)} BackgroundTransparency={1} ZIndex={10}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				Padding={udim(0, THEME.gap)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>

			<EnvDropdown />
			<SearchBox search={atomSearch} placeholder="Search atoms..." />

			<ToolbarButton name="Timeline" text="Timeline" active={timeline} LayoutOrder={2} onClick={toggleTimeline} />

			<SortButton />
			<FilterButton />
		</frame>
	);
}
