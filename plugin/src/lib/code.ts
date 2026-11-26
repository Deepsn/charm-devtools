import { THEME } from "constants/theme";
import { formatKey, formatValue, getEntries, isArray, isTable } from "lib/format";

const MAX_DEPTH = 8;
const MAX_LINES = 1500;
const INDENT = "  ";

export function escapeRichText(text: string): string {
	return text.gsub("&", "&amp;")[0].gsub("<", "&lt;")[0].gsub(">", "&gt;")[0].gsub('"', "&quot;")[0];
}

function paint(text: string, color: Color3): string {
	return `<font color="#${color.ToHex()}">${escapeRichText(text)}</font>`;
}

const punct = (text: string) => paint(text, THEME.tree.punctuation);

/** A value pretty-printed line by line, as plain text (for comparing) and highlighted rich text (for display). */
export interface RenderedValue {
	plain: string[];
	rich: string[];
}

/** A run of text with its plain form and its highlighted rich-text form. */
type Piece = [plain: string, rich: string];

const piece = (text: string, color: Color3): Piece => [text, paint(text, color)];
const punctPiece = (text: string): Piece => [text, punct(text)];
const EMPTY: Piece = ["", ""];

export function renderValue(value: unknown): RenderedValue {
	const plain: string[] = [];
	const rich: string[] = [];
	const seen = new Set<object>();

	function push(indent: string, ...pieces: Piece[]) {
		if (plain.size() < MAX_LINES) {
			let plainLine = indent;
			let richLine = indent;
			for (const [plainText, richText] of pieces) {
				plainLine += plainText;
				richLine += richText;
			}
			plain.push(plainLine);
			rich.push(richLine);
		} else if (plain.size() === MAX_LINES) {
			plain.push("... truncated");
			rich.push(paint("... truncated", THEME.textDim));
		}
	}

	function write(current: unknown, indent: string, prefix: Piece, suffix: Piece, depth: number) {
		if (!isTable(current)) {
			const formatted = formatValue(current);
			const text = formatted.text.gsub("\n", "\\n")[0];
			push(indent, prefix, piece(text, formatted.color), suffix);
			return;
		}

		const array = isArray(current);
		const [open, close] = array ? ["[", "]"] : ["{", "}"];
		const entries = getEntries(current);

		if (entries.isEmpty()) {
			push(indent, prefix, punctPiece(open + close), suffix);
			return;
		}
		if (seen.has(current) || depth >= MAX_DEPTH) {
			const text = seen.has(current) ? "<cycle>" : `${open}...${close}`;
			push(indent, prefix, piece(text, THEME.tree.preview), suffix);
			return;
		}

		seen.add(current);
		push(indent, prefix, punctPiece(open));
		const last = entries.size() - 1;
		for (const [index, entry] of ipairs(entries)) {
			let key = EMPTY;
			if (!array) {
				const name = formatKey(entry.key);
				key = [`${name}: `, `${paint(name, THEME.tree.key)}${punct(": ")}`];
			}
			write(entry.value, indent + INDENT, key, index - 1 < last ? punctPiece(",") : EMPTY, depth + 1);
		}
		push(indent, punctPiece(close), suffix);
		seen.delete(current);
	}

	write(value, "", EMPTY, EMPTY, 0);
	return { plain, rich };
}

export function highlightValue(value: unknown): string[] {
	return renderValue(value).rich;
}
