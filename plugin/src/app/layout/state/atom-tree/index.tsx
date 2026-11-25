import Vide, { derive, effect, Show, source, untrack } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { Card } from "app/components/card";
import { VirtualizedList } from "app/components/virtualized-list";
import type { Action } from "atoms";
import { atoms } from "atoms/atoms";
import { atomSearch, collapsedGroups, envScope, kindFilter, sortMode } from "atoms/inspector";
import { FONT, THEME } from "constants/theme";
import { buildTreeRows } from "./rows";
import { TreeRowView } from "./tree-row";
import { FLASH_DURATION, ROW_HEIGHT } from "./types";

function useUpdatedAt(actions: () => readonly Action[]) {
	const updatedAt = source<ReadonlyMap<string, number>>(new Map());
	let previousLatest = new Map<string, Action>();

	effect(() => {
		const latest = new Map<string, Action>();
		for (const action of actions()) latest.set(action.atomId, action);

		untrack(() => {
			const now = os.clock();
			const nextUpdatedAt = new Map<string, number>();
			for (const [atomId, time] of updatedAt()) {
				if (latest.has(atomId) && now - time < FLASH_DURATION) nextUpdatedAt.set(atomId, time);
			}
			for (const [atomId, action] of latest) {
				const previous = previousLatest.get(atomId);
				if (previous !== undefined && previous !== action) nextUpdatedAt.set(atomId, now);
			}
			updatedAt(nextUpdatedAt);
		});
		previousLatest = latest;
	});

	return updatedAt;
}

export function AtomTree() {
	const atomsState = useAtom(atoms);
	const search = useAtom(atomSearch);
	const scope = useAtom(envScope);
	const kinds = useAtom(kindFilter);
	const collapsed = useAtom(collapsedGroups);
	const sort = useAtom(sortMode);

	const updatedAt = useUpdatedAt(atomsState);

	const rows = derive(() =>
		buildTreeRows(atomsState(), {
			query: search(),
			scope: scope(),
			kinds: kinds(),
			collapsed: collapsed(),
			byRecent: sort() === "recent",
		}),
	);

	const emptyText = () => {
		if (atomsState().isEmpty()) return "No atoms hooked yet";
		return "No matching atoms";
	};

	return (
		<Card name="AtomTree" padding={6}>
			<Show when={() => rows().isEmpty()}>
				{() => (
					<textlabel
						Name="Empty"
						Size={new UDim2(1, 0, 0, ROW_HEIGHT)}
						Position={UDim2.fromOffset(8, 2)}
						BackgroundTransparency={1}
						Text={emptyText}
						TextColor3={THEME.textDim}
						TextSize={THEME.fontSize}
						Font={FONT.ui}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
				)}
			</Show>

			<VirtualizedList
				items={rows}
				rowHeight={ROW_HEIGHT}
				spacing={1}
				ScrollBarThickness={6}
				ScrollBarImageColor3={THEME.scrollbar}
				render={(row) => <TreeRowView row={row} showEnv={() => scope() === "all"} updatedAt={updatedAt} />}
			/>
		</Card>
	);
}
