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

export function highlightValue(value: unknown): string[] {
	const lines: string[] = [];
	const seen = new Set<object>();

	function push(line: string) {
		if (lines.size() < MAX_LINES) {
			lines.push(line);
		} else if (lines.size() === MAX_LINES) {
			lines.push(paint("... truncated", THEME.textDim));
		}
	}

	function write(current: unknown, indent: string, prefix: string, suffix: string, depth: number) {
		if (!isTable(current)) {
			const formatted = formatValue(current);
			const text = formatted.text.gsub("\n", "\\n")[0];
			push(`${indent}${prefix}${paint(text, formatted.color)}${suffix}`);
			return;
		}

		const array = isArray(current);
		const [open, close] = array ? ["[", "]"] : ["{", "}"];
		const entries = getEntries(current);

		if (entries.isEmpty()) {
			push(`${indent}${prefix}${punct(open + close)}${suffix}`);
			return;
		}
		if (seen.has(current) || depth >= MAX_DEPTH) {
			push(
				`${indent}${prefix}${paint(seen.has(current) ? "<cycle>" : `${open}...${close}`, THEME.tree.preview)}${suffix}`,
			);
			return;
		}

		seen.add(current);
		push(`${indent}${prefix}${punct(open)}`);
		const last = entries.size() - 1;
		for (const [index, entry] of ipairs(entries)) {
			const key = array ? "" : `${paint(formatKey(entry.key), THEME.tree.key)}${punct(": ")}`;
			write(entry.value, indent + INDENT, key, index - 1 < last ? punct(",") : "", depth + 1);
		}
		push(`${indent}${punct(close)}${suffix}`);
		seen.delete(current);
	}

	write(value, "", "", "", 0);
	return lines;
}
