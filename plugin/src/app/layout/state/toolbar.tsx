import type { Atom } from "@rbxts/charm";
import Vide, { source } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { ToolbarButton } from "app/components/button";
import { Icon } from "app/components/icon";
import { Popover, PopoverItem, PopoverTitle } from "app/components/popover";
import { atomSearch, type EnvScope, envScope, kindFilter, sortMode, toggleKindFilter } from "atoms/inspector";
import { timelineEnabled, toggleTimeline } from "atoms/timeline";
import { ICONS } from "constants/icons";
import { FONT, THEME } from "constants/theme";
import { envColor, kindColor, VALUE_KINDS, type ValueKind } from "lib/format";

const ENV_OPTIONS: readonly { id: EnvScope; label: string }[] = [
	{ id: "all", label: "All environments" },
	{ id: "server", label: "Server" },
	{ id: "client", label: "LocalPlayer" },
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
			Size={new UDim2(0, ENV_WIDTH, 1, 0)}
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
			<uicorner CornerRadius={new UDim(0, THEME.radius)} />
			<uistroke Color={THEME.border} />
			<uipadding PaddingLeft={new UDim(0, 12)} PaddingRight={new UDim(0, 12)} />

			<frame
				Name="Dot"
				AnchorPoint={new Vector2(0, 0.5)}
				Position={UDim2.fromScale(0, 0.5)}
				Size={UDim2.fromOffset(8, 8)}
				BackgroundColor3={() => scopeColor(scope())}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(1, 0)} />
			</frame>

			<textlabel
				Name="Label"
				Position={UDim2.fromOffset(16, 0)}
				Size={new UDim2(1, -30, 1, 0)}
				BackgroundTransparency={1}
				Text={label}
				TextColor3={THEME.text}
				TextSize={THEME.fontSize}
				Font={FONT.bold}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextTruncate={Enum.TextTruncate.AtEnd}
			/>

			<textlabel
				Name="Chevron"
				AnchorPoint={new Vector2(1, 0)}
				Position={UDim2.fromScale(1, 0)}
				Size={new UDim2(0, 12, 1, 0)}
				BackgroundTransparency={1}
				Text={() => (open() ? "▲" : "▼")}
				TextColor3={THEME.textMuted}
				TextSize={9}
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
			<uicorner CornerRadius={new UDim(0, THEME.radius)} />
			<uistroke Color={() => (focused() ? THEME.accent : THEME.border)} />
			<uipadding PaddingLeft={new UDim(0, 12)} PaddingRight={new UDim(0, 8)} />

			<Icon image={ICONS.search} Position={UDim2.fromScale(0, 0.5)} Size={20} AnchorPoint={new Vector2(0, 0.5)} />

			<textbox
				Name="Input"
				Position={UDim2.fromOffset(24, 0)}
				Size={new UDim2(1, -48, 1, 0)}
				BackgroundTransparency={1}
				Text={search}
				PlaceholderText={props.placeholder}
				PlaceholderColor3={THEME.textDim}
				TextColor3={THEME.text}
				TextSize={THEME.fontSize}
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
				Size={UDim2.fromOffset(18, 18)}
				BackgroundTransparency={1}
				Text="×"
				TextColor3={THEME.textMuted}
				TextSize={THEME.fontSize + 3}
				Font={FONT.medium}
				Visible={() => search() !== ""}
				Activated={() => props.search("")}
			/>
		</frame>
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
	const sort = useAtom(sortMode);

	return (
		<frame Name="Toolbar" Size={new UDim2(1, 0, 0, THEME.filterHeight)} BackgroundTransparency={1} ZIndex={10}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				Padding={new UDim(0, THEME.gap)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>

			<EnvDropdown />
			<SearchBox search={atomSearch} placeholder="Search atoms..." />

			<ToolbarButton name="Timeline" text="Timeline" active={timeline} LayoutOrder={2} onClick={toggleTimeline} />

			<ToolbarButton
				name="Sort"
				text={() => (sort() === "name" ? "Sort: A–Z" : "Sort: Recent")}
				LayoutOrder={3}
				onClick={() => sortMode(sort() === "name" ? "recent" : "name")}
			/>

			<FilterButton />
		</frame>
	);
}
