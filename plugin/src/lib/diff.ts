import { renderValue } from "lib/code";

export type DiffMode = "split" | "inline" | "none";

export type LineKind = "same" | "added" | "removed";

/** One line of a line diff; line numbers are 1-based and only set on the side the line exists in. */
export interface DiffLine {
	kind: LineKind;
	oldLine?: number;
	newLine?: number;
}

/** Above this many cells the LCS table is skipped and the changed region is shown as a full replacement. */
const MAX_LCS_CELLS = 250_000;
/** Unchanged lines kept around each change; longer unchanged runs are collapsed. */
const CONTEXT_LINES = 3;

/** GitHub-style line diff: common prefix/suffix, then an LCS over the changed middle. */
export function diffLines(before: readonly string[], after: readonly string[]): DiffLine[] {
	const oldSize = before.size();
	const newSize = after.size();

	let start = 0;
	while (start < oldSize && start < newSize && before[start] === after[start]) start++;

	let oldEnd = oldSize;
	let newEnd = newSize;
	while (oldEnd > start && newEnd > start && before[oldEnd - 1] === after[newEnd - 1]) {
		oldEnd--;
		newEnd--;
	}

	const lines: DiffLine[] = [];
	for (const index of $range(0, start - 1)) lines.push({ kind: "same", oldLine: index + 1, newLine: index + 1 });

	const rows = oldEnd - start;
	const columns = newEnd - start;

	if (rows * columns > MAX_LCS_CELLS) {
		for (const index of $range(start, oldEnd - 1)) lines.push({ kind: "removed", oldLine: index + 1 });
		for (const index of $range(start, newEnd - 1)) lines.push({ kind: "added", newLine: index + 1 });
	} else if (rows > 0 || columns > 0) {
		// lengths[i][j]: LCS length of before[start + i..] and after[start + j..]
		const width = columns + 1;
		const lengths = table.create<number>((rows + 1) * width, 0);
		for (let i = rows - 1; i >= 0; i--) {
			for (let j = columns - 1; j >= 0; j--) {
				lengths[i * width + j] =
					before[start + i] === after[start + j]
						? lengths[(i + 1) * width + j + 1] + 1
						: math.max(lengths[(i + 1) * width + j], lengths[i * width + j + 1]);
			}
		}

		let i = 0;
		let j = 0;
		while (i < rows || j < columns) {
			if (i < rows && j < columns && before[start + i] === after[start + j]) {
				lines.push({ kind: "same", oldLine: start + i + 1, newLine: start + j + 1 });
				i++;
				j++;
			} else if (j >= columns || (i < rows && lengths[(i + 1) * width + j] >= lengths[i * width + j + 1])) {
				lines.push({ kind: "removed", oldLine: start + i + 1 });
				i++;
			} else {
				lines.push({ kind: "added", newLine: start + j + 1 });
				j++;
			}
		}
	}

	const offset = newEnd - oldEnd;
	for (const index of $range(oldEnd, oldSize - 1)) {
		lines.push({ kind: "same", oldLine: index + 1, newLine: index + offset + 1 });
	}

	return groupChanges(lines);
}

/** Within each run of changed lines, lists every removal before the additions, like GitHub. */
function groupChanges(lines: DiffLine[]): DiffLine[] {
	const result: DiffLine[] = [];
	let removed: DiffLine[] = [];
	let added: DiffLine[] = [];

	const flush = () => {
		for (const line of removed) result.push(line);
		for (const line of added) result.push(line);
		removed = [];
		added = [];
	};

	for (const line of lines) {
		if (line.kind === "removed") removed.push(line);
		else if (line.kind === "added") added.push(line);
		else {
			flush();
			result.push(line);
		}
	}
	flush();
	return result;
}

export type BlockKind = LineKind | "empty" | "collapsed";

/** Consecutive diff lines of one kind, rendered as a single highlighted strip. */
export interface DiffBlock {
	kind: BlockKind;
	/** Line count; for `collapsed` blocks, the number of hidden unchanged lines. */
	count: number;
	oldNumbers: string;
	newNumbers: string;
	signs: string;
	text: string;
}

export interface ValueDiff {
	/** One column of blocks for the inline view. */
	inline: DiffBlock[];
	/** Left (previous) and right (current) columns of the side-by-side view, row-aligned. */
	left: DiffBlock[];
	right: DiffBlock[];
	added: number;
	removed: number;
}

const SIGN: Record<BlockKind, string> = { same: " ", added: "+", removed: "-", empty: " ", collapsed: "" };

class BlockBuilder {
	readonly blocks: DiffBlock[] = [];
	private current?: { kind: BlockKind; old: string[]; new: string[]; text: string[] };

	push(kind: BlockKind, oldLine: number | undefined, newLine: number | undefined, text: string) {
		if (this.current === undefined || this.current.kind !== kind) {
			this.flush();
			this.current = { kind, old: [], new: [], text: [] };
		}
		// empty trailing lines would be dropped from a label's height, so blanks are padded with a space
		this.current.old.push(oldLine !== undefined ? tostring(oldLine) : " ");
		this.current.new.push(newLine !== undefined ? tostring(newLine) : " ");
		this.current.text.push(text === "" ? " " : text);
	}

	collapse(count: number) {
		this.flush();
		this.blocks.push({ kind: "collapsed", count, oldNumbers: "", newNumbers: "", signs: "", text: "" });
	}

	flush() {
		const current = this.current;
		if (current === undefined) return;
		const count = current.text.size();
		const signs = current.text.map(() => SIGN[current.kind]);
		this.blocks.push({
			kind: current.kind,
			count,
			oldNumbers: current.old.join("\n"),
			newNumbers: current.new.join("\n"),
			signs: signs.join("\n"),
			text: current.text.join("\n"),
		});
		this.current = undefined;
	}
}

/** Indices of `same` lines hidden because they are farther than `CONTEXT_LINES` from any change. */
function hiddenLines(lines: readonly DiffLine[]): Set<number> {
	const hidden = new Set<number>();
	const size = lines.size();
	let index = 0;
	while (index < size) {
		if (lines[index].kind !== "same") {
			index++;
			continue;
		}
		let runEnd = index;
		while (runEnd < size && lines[runEnd].kind === "same") runEnd++;

		const keepStart = index === 0 ? 0 : CONTEXT_LINES;
		const keepEnd = runEnd === size ? 0 : CONTEXT_LINES;
		const from = index + keepStart;
		const to = runEnd - keepEnd;
		// collapsing fewer than two lines saves nothing
		if (to - from >= 2) for (const hiddenIndex of $range(from, to - 1)) hidden.add(hiddenIndex);
		index = runEnd;
	}

	// an unchanged value has nothing worth hiding
	if (hidden.size() === size) hidden.clear();
	return hidden;
}

export function diffValues(previous: unknown, current: unknown, hasPrevious: boolean): ValueDiff {
	const before = hasPrevious ? renderValue(previous) : { plain: [], rich: [] };
	const after = renderValue(current);
	const lines = diffLines(before.plain, after.plain);
	const hidden = hiddenLines(lines);

	const oldText = (line: DiffLine) => (line.oldLine !== undefined ? before.rich[line.oldLine - 1] : "");
	const newText = (line: DiffLine) => (line.newLine !== undefined ? after.rich[line.newLine - 1] : "");

	const inline = new BlockBuilder();
	const left = new BlockBuilder();
	const right = new BlockBuilder();
	let added = 0;
	let removed = 0;

	let pendingRemoved: DiffLine[] = [];
	let pendingAdded: DiffLine[] = [];
	const flushSplit = () => {
		const rows = math.max(pendingRemoved.size(), pendingAdded.size());
		for (const row of $range(0, rows - 1)) {
			const oldLine = pendingRemoved[row];
			const newLine = pendingAdded[row];
			if (oldLine !== undefined) left.push("removed", oldLine.oldLine, undefined, oldText(oldLine));
			else left.push("empty", undefined, undefined, "");
			if (newLine !== undefined) right.push("added", undefined, newLine.newLine, newText(newLine));
			else right.push("empty", undefined, undefined, "");
		}
		pendingRemoved = [];
		pendingAdded = [];
	};

	let collapsed = 0;
	const flushCollapsed = () => {
		if (collapsed === 0) return;
		inline.collapse(collapsed);
		left.collapse(collapsed);
		right.collapse(collapsed);
		collapsed = 0;
	};

	for (const [position, line] of ipairs(lines)) {
		if (line.kind === "removed") {
			removed++;
			inline.push("removed", line.oldLine, undefined, oldText(line));
			pendingRemoved.push(line);
		} else if (line.kind === "added") {
			added++;
			inline.push("added", undefined, line.newLine, newText(line));
			pendingAdded.push(line);
		} else {
			flushSplit();
			if (hidden.has(position - 1)) {
				collapsed++;
				continue;
			}
			flushCollapsed();
			inline.push("same", line.oldLine, line.newLine, newText(line));
			left.push("same", line.oldLine, undefined, oldText(line));
			right.push("same", undefined, line.newLine, newText(line));
		}
	}
	flushSplit();
	flushCollapsed();
	inline.flush();
	left.flush();
	right.flush();

	return { inline: inline.blocks, left: left.blocks, right: right.blocks, added, removed };
}
