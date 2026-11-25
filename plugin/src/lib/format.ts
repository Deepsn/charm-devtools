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
	return isArray(value) ? `Array(${entries.size()})` : `{...} ${entries.size()}`;
}

export function formatTime(unix: number): string {
	return DateTime.fromUnixTimestamp(unix).FormatLocalTime("HH:mm:ss", "en-us");
}

export type ValueKind = "table" | "boolean" | "number" | "string" | "other";

export const VALUE_KINDS: readonly ValueKind[] = ["table", "boolean", "number", "string", "other"];

export function valueKind(value: unknown): ValueKind {
	const kind = typeOf(value);
	if (kind === "table" || kind === "boolean" || kind === "number" || kind === "string") return kind;
	return "other";
}

export function kindColor(kind: ValueKind): Color3 {
	return THEME.kind[kind];
}

const IDENTIFIER = "^[%a_][%w_]*$";

export function formatKey(key: unknown): string {
	if (typeIs(key, "string")) {
		return key.match(IDENTIFIER)[0] !== undefined ? key : `["${key}"]`;
	}
	return `[${tostring(key)}]`;
}

const MAX_SIGNATURE_KEYS = 4;

export function describeType(value: unknown, depth = 0): string {
	if (!isTable(value)) {
		const kind = typeOf(value);
		return kind === "nil" ? "undefined" : kind;
	}

	const entries = getEntries(value);
	if (entries.isEmpty()) return "{}";
	if (isArray(value)) return `${describeType(entries[0].value, depth + 1)}[]`;
	if (depth >= 2) return "{...}";

	const parts: string[] = [];
	for (const [index, entry] of ipairs(entries)) {
		if (index > MAX_SIGNATURE_KEYS) {
			parts.push("...");
			break;
		}
		parts.push(`${formatKey(entry.key)}: ${describeType(entry.value, depth + 1)}`);
	}
	return `{ ${parts.join("; ")} }`;
}

const PREVIEW_LENGTH = 48;

export function previewValue(value: unknown, depth = 0): string {
	if (!isTable(value)) return formatValue(value).text;

	const entries = getEntries(value);
	if (entries.isEmpty()) return "{}";
	if (depth >= 1) return isArray(value) ? "[...]" : "{...}";

	const array = isArray(value);
	const parts: string[] = [];
	let length = 0;
	for (const entry of entries) {
		const item = array
			? previewValue(entry.value, depth + 1)
			: `${formatKey(entry.key)}: ${previewValue(entry.value, depth + 1)}`;
		if (length + item.size() > PREVIEW_LENGTH && !parts.isEmpty()) {
			parts.push("...");
			break;
		}
		parts.push(item);
		length += item.size() + 2;
	}

	const body = parts.join(", ");
	return array ? `[${body}]` : `{ ${body} }`;
}

export function deepEqual(a: unknown, b: unknown, depth = 0): boolean {
	if (a === b) return true;
	if (!isTable(a) || !isTable(b) || depth > 16) return false;

	const left = a as Map<unknown, unknown>;
	const right = b as Map<unknown, unknown>;
	for (const [key, value] of pairs(left)) {
		if (!deepEqual(value, right.get(key), depth + 1)) return false;
	}
	for (const [key] of pairs(right)) {
		if (left.get(key) === undefined) return false;
	}
	return true;
}

export function changedKeys(previous: unknown, current: unknown): string[] {
	if (!isTable(previous) || !isTable(current)) return [];

	const keys = new Set<unknown>();
	for (const entry of getEntries(previous)) keys.add(entry.key);
	for (const entry of getEntries(current)) keys.add(entry.key);

	const changed: string[] = [];
	for (const key of keys) {
		const a = (previous as Map<unknown, unknown>).get(key);
		const b = (current as Map<unknown, unknown>).get(key);
		if (!deepEqual(a, b)) changed.push(tostring(key));
	}
	changed.sort();
	return changed;
}

export interface AtomPath {
	group?: string;
	leaf: string;
}

export function splitAtomName(name: string): AtomPath {
	const [slash] = name.find("/[^/]*$");
	const [dot] = name.find("%.[^%.]*$");
	const index = slash ?? dot;
	if (index === undefined || index <= 1 || index >= name.size()) return { leaf: name };
	return { group: name.sub(1, index - 1), leaf: name.sub(index + 1) };
}

export function includesText(haystack: string, needle: string): boolean {
	if (needle === "") return true;
	const [found] = haystack.lower().find(needle.lower(), 1, true);
	return found !== undefined;
}
