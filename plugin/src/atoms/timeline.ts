import { atom, computed } from "@rbxts/charm";
import type { Action } from "atoms";
import { clearHistory, history } from "atoms/history";
import { envScope, inScope, selectedAtomId } from "atoms/inspector";
import { includesText } from "lib/format";

export type Timeline = ReturnType<typeof createTimeline>;

/** Playback state over a list of updates (newest first) with its own cursor. */
function createTimeline(source: () => Action[]) {
	const entries = computed(() => {
		const list = source();
		list.sort((a, b) => a.timestamp > b.timestamp);
		return list;
	});

	/** Id of the update the timeline is pinned to; `undefined` follows the latest update live. */
	const cursor = atom<string | undefined>(undefined);

	const pinnedEntry = computed(() => {
		const id = cursor();
		return id !== undefined ? entries().find((entry) => entry.id === id) : undefined;
	});

	// a cursor that no longer matches an entry (e.g. another atom got selected) falls back to live
	const paused = computed(() => pinnedEntry() !== undefined);

	const active = computed(() => pinnedEntry() ?? entries()[0]);

	const pin = (entry: Action) => cursor(entry.id);

	const step = (direction: "older" | "newer") => {
		const list = entries();
		if (list.isEmpty()) return;

		const current = active();
		let index = current !== undefined ? list.indexOf(current) : 0;
		index = direction === "older" ? math.min(index + 1, list.size() - 1) : math.max(index - 1, 0);
		pin(list[index]);
	};

	const toggleLive = () => {
		if (paused()) {
			cursor(undefined);
			return;
		}
		const entry = active();
		if (entry !== undefined) cursor(entry.id);
	};

	return { entries, cursor, paused, active, select: pin, step, toggleLive };
}

/** Whether the selected atom's timeline is shown on the State page. */
export const timelineEnabled = atom(false);

export function toggleTimeline() {
	timelineEnabled((enabled) => !enabled);
	atomTimeline.cursor(undefined);
}

/** Updates of the atom selected on the State page. */
export const atomTimeline = createTimeline(() => {
	const id = selectedAtomId();
	return id !== undefined ? history().filter((action) => action.atomId === id) : [];
});

export const timelineSearch = atom("");

/** Updates of every atom within the environment scope, for the Timeline page. */
export const globalTimeline = createTimeline(() => {
	const scope = envScope();
	const query = timelineSearch();
	return history().filter((action) => inScope(scope, action.env) && includesText(action.name, query));
});

/** Latest update of the same atom that happened before `action`. */
export function findPrevious(list: readonly Action[], action: Action) {
	let previous: Action | undefined;
	for (const candidate of list) {
		if (candidate.atomId !== action.atomId || candidate.timestamp >= action.timestamp) continue;
		if (previous === undefined || candidate.timestamp > previous.timestamp) previous = candidate;
	}
	return previous;
}

export function clearAll() {
	clearHistory();
	atomTimeline.cursor(undefined);
	globalTimeline.cursor(undefined);
	selectedAtomId(undefined);
}
