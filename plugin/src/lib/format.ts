import { THEME } from "constants/theme";

export function envColor(env: "client" | "server"): Color3 {
	return env === "server" ? THEME.env.server : THEME.env.client;
}

export interface Entry {
	key: unknown;
	value: unknown;
}

export function isTable(value: unknown): value is object {
	return typeIs(value, "table");
}

export function isArray(value: object): boolean {
	let count = 0;
	let maxIndex = 0;
	for (const [key] of pairs(value as Map<unknown, unknown>)) {
		count += 1;
		if (typeIs(key, "number")) maxIndex = math.max(maxIndex, key);
	}
	return count > 0 && count === maxIndex;
}

export function getEntries(value: object): Entry[] {
	const entries: Entry[] = [];
	for (const [key, entry] of pairs(value as Map<unknown, unknown>)) {
		entries.push({ key, value: entry });
	}

	entries.sort((a, b) => {
		const ka = a.key;
		const kb = b.key;
		if (typeIs(ka, "number") && typeIs(kb, "number")) return ka < kb;
		if (typeIs(ka, "number")) return true;
		if (typeIs(kb, "number")) return false;
		return tostring(ka) < tostring(kb);
	});

	return entries;
}

export function displayKey(key: unknown): string {
	return tostring(key);
}

export interface FormattedValue {
	text: string;
	color: Color3;
}

export function formatValue(value: unknown): FormattedValue {
	const kind = typeOf(value);

	if (kind === "string") return { text: `"${value as string}"`, color: THEME.tree.string };
	if (kind === "number") return { text: tostring(value), color: THEME.tree.number };
	if (kind === "boolean") return { text: tostring(value), color: THEME.tree.boolean };
	if (kind === "nil") return { text: "nil", color: THEME.tree.null };
	if (kind === "function") return { text: "ƒ()", color: THEME.tree.fn };

	return { text: tostring(value), color: THEME.tree.other };
}

export function previewTable(value: object): string {
	const entries = getEntries(value);
	if (entries.size() === 0) return "{ }";
	return isArray(value) ? `Array(${entries.size()})` : `{…} ${entries.size()}`;
}

export function formatTime(unix: number): string {
	return DateTime.fromUnixTimestamp(unix).FormatLocalTime("HH:mm:ss", "en-us");
}

export function includesText(haystack: string, needle: string): boolean {
	if (needle === "") return true;
	const [found] = haystack.lower().find(needle.lower(), 1, true);
	return found !== undefined;
}
