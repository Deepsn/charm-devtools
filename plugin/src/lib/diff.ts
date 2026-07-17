export type DiffOp = "equal" | "removed" | "added";

export interface DiffLine {
	op: DiffOp;
	oldText: string | undefined;
	newText: string | undefined;
}

function toLines(text: string): string[] {
	const result = text.split("\n");
	if (result.size() > 0 && result[result.size() - 1] === "") {
		result.pop();
	}
	return result;
}

export function diffLines(oldText: string, newText: string): DiffLine[] {
	const a = toLines(oldText);
	const b = toLines(newText);
	const n = a.size();
	const m = b.size();

	const lcs: number[][] = [];
	for (const _ of $range(0, n)) {
		lcs.push(table.create(m + 1, 0));
	}

	for (let i = n - 1; i >= 0; i--) {
		for (let j = m - 1; j >= 0; j--) {
			if (a[i] === b[j]) {
				lcs[i][j] = lcs[i + 1][j + 1] + 1;
			} else {
				lcs[i][j] = math.max(lcs[i + 1][j], lcs[i][j + 1]);
			}
		}
	}

	const rows: DiffLine[] = [];
	let i = 0;
	let j = 0;
	while (i < n && j < m) {
		if (a[i] === b[j]) {
			rows.push({ op: "equal", oldText: a[i], newText: b[j] });
			i += 1;
			j += 1;
		} else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
			rows.push({ op: "removed", oldText: a[i], newText: undefined });
			i += 1;
		} else {
			rows.push({ op: "added", oldText: undefined, newText: b[j] });
			j += 1;
		}
	}
	while (i < n) {
		rows.push({ op: "removed", oldText: a[i], newText: undefined });
		i += 1;
	}
	while (j < m) {
		rows.push({ op: "added", oldText: undefined, newText: b[j] });
		j += 1;
	}

	return rows;
}
