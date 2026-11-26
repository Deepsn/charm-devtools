import Vide, { derive, effect, Show, source, untrack } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { Card } from "app/components/card";
import { VirtualizedList } from "app/components/virtualized-list";
import { offset, px, udim2 } from "app/hooks/use-px";
import type { Action } from "atoms";
import { atoms, counterparts } from "atoms/atoms";
import { atomSearch, collapsedGroups, kindFilter, sortMode } from "atoms/inspector";
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
	const kinds = useAtom(kindFilter);
	const collapsed = useAtom(collapsedGroups);
	const sort = useAtom(sortMode);
	const pairedAtoms = useAtom(counterparts);

	const updatedAt = useUpdatedAt(atomsState);

	const rows = derive(() =>
		buildTreeRows(atomsState(), {
			query: search(),
			kinds: kinds(),
			collapsed: collapsed(),
			byRecent: sort() === "recent",
			counterparts: pairedAtoms(),
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
						Size={udim2(1, 0, 0, ROW_HEIGHT)}
						Position={offset(8, 2)}
						BackgroundTransparency={1}
						Text={emptyText}
						TextColor3={THEME.textDim}
						TextSize={px(THEME.fontSize)}
						FontFace={FONT.ui}
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
				render={(row) => <TreeRowView row={row} updatedAt={updatedAt} />}
			/>
		</Card>
	);
}
