export const THEME = {
	// surfaces
	windowBg: Color3.fromRGB(17, 17, 21),
	panelBg: Color3.fromRGB(22, 22, 28),
	toolbarBg: Color3.fromRGB(22, 22, 28),
	inputBg: Color3.fromRGB(15, 15, 19),
	valueBg: Color3.fromRGB(16, 16, 21),
	rowHover: Color3.fromRGB(34, 34, 44),
	rowSelected: Color3.fromRGB(37, 41, 82),
	divider: Color3.fromRGB(38, 38, 48),
	cardBg: Color3.fromRGB(27, 27, 35),
	chipBg: Color3.fromRGB(34, 34, 44),

	// accents / chrome
	accent: Color3.fromRGB(99, 102, 241),
	accentText: Color3.fromRGB(165, 168, 255),
	frameBg: Color3.fromRGB(34, 34, 44),
	border: Color3.fromRGB(44, 44, 56),
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

	// atom value-kind icons
	kind: {
		table: Color3.fromRGB(167, 139, 250),
		boolean: Color3.fromRGB(74, 222, 128),
		number: Color3.fromRGB(34, 211, 238),
		string: Color3.fromRGB(251, 191, 36),
		other: Color3.fromRGB(148, 148, 156),
	},
	folder: Color3.fromRGB(139, 92, 246),

	dependent: {
		atom: Color3.fromRGB(99, 102, 241),
		computed: Color3.fromRGB(34, 211, 238),
		effect: Color3.fromRGB(251, 146, 60),
		listener: Color3.fromRGB(244, 114, 182),
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

	// value diff (GitHub dark inspired)
	diff: {
		added: Color3.fromRGB(46, 160, 67),
		removed: Color3.fromRGB(248, 81, 73),
		addedText: Color3.fromRGB(86, 211, 100),
		removedText: Color3.fromRGB(248, 113, 106),
		lineTransparency: 0.85,
		gutterTransparency: 0.7,
		empty: Color3.fromRGB(34, 34, 44),
		collapsed: Color3.fromRGB(37, 41, 82),
	},

	// sizes
	fontSize: 13,
	monoSize: 13,
	sectionSize: 14,
	labelSize: 10,
	rowHeight: 26,
	rowSpacing: 2,
	treeRowHeight: 20,
	codeLineHeight: 18,
	indent: 14,
	padding: 8,
	listWidth: 230,

	// shell chrome
	railWidth: 44,
	railItemHeight: 40,
	railIconSize: 24,
	filterHeight: 32,
	tabHeight: 24,
	gap: 8,
	radius: 6,
} as const;

const BUILDEREXTENDED = "rbxasset://fonts/families/BuilderExtended.json";
const BUILDERSANS = "rbxasset://fonts/families/BuilderSans.json";
const INCONSOLATA = "rbxasset://fonts/families/Inconsolata.json";

export const FONT = {
	ui: new Font(BUILDEREXTENDED, Enum.FontWeight.SemiBold),
	medium: new Font(BUILDEREXTENDED, Enum.FontWeight.Bold),
	bold: new Font(BUILDERSANS, Enum.FontWeight.ExtraBold),
	mono: new Font(INCONSOLATA, Enum.FontWeight.Medium),
} as const;
