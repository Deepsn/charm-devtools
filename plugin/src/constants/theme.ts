export const THEME = {
	// surfaces
	windowBg: Color3.fromRGB(24, 24, 27),
	panelBg: Color3.fromRGB(30, 30, 34),
	toolbarBg: Color3.fromRGB(30, 30, 34),
	inputBg: Color3.fromRGB(18, 18, 20),
	rowHover: Color3.fromRGB(39, 39, 44),
	rowSelected: Color3.fromRGB(38, 51, 78),
	divider: Color3.fromRGB(45, 45, 51),
	cardBg: Color3.fromRGB(32, 32, 36),
	chipBg: Color3.fromRGB(39, 39, 44),

	// accents / chrome
	accent: Color3.fromRGB(59, 130, 246),
	frameBg: Color3.fromRGB(39, 39, 42),
	border: Color3.fromRGB(52, 52, 58),
	rail: Color3.fromRGB(63, 63, 70),

	// activity rail
	railBg: Color3.fromRGB(18, 18, 21),
	icon: Color3.fromRGB(130, 130, 140),
	iconActive: Color3.fromRGB(236, 236, 240),

	// text
	text: Color3.fromRGB(228, 228, 231),
	textMuted: Color3.fromRGB(148, 148, 156),
	textDim: Color3.fromRGB(103, 103, 112),
	scrollbar: Color3.fromRGB(82, 82, 91),

	// environment badges
	env: {
		client: Color3.fromRGB(56, 132, 232),
		server: Color3.fromRGB(120, 180, 90),
	},

	// value-tree syntax highlighting (VS Code dark inspired)
	tree: {
		key: Color3.fromRGB(156, 220, 254),
		string: Color3.fromRGB(152, 195, 121),
		number: Color3.fromRGB(209, 154, 102),
		boolean: Color3.fromRGB(197, 134, 192),
		null: Color3.fromRGB(127, 132, 142),
		fn: Color3.fromRGB(220, 220, 170),
		other: Color3.fromRGB(180, 180, 190),
		punctuation: Color3.fromRGB(120, 120, 128),
		preview: Color3.fromRGB(120, 120, 128),
		arrow: Color3.fromRGB(148, 148, 156),
	},

	// sizes
	fontSize: 13,
	monoSize: 13,
	sectionSize: 14,
	labelSize: 10,
	rowHeight: 28,
	rowSpacing: 4,
	treeRowHeight: 20,
	indent: 14,
	padding: 8,
	listWidth: 220,

	// shell chrome
	railWidth: 44,
	railItemHeight: 40,
	railIconSize: 18,
	filterHeight: 30,
	tabHeight: 28,
	gap: 8,
	radius: 6,
} as const;

export const FONT = {
	ui: Enum.Font.Gotham,
	medium: Enum.Font.GothamMedium,
	bold: Enum.Font.GothamBold,
	mono: Enum.Font.Code,
} as const;
