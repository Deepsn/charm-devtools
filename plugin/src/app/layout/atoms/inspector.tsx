import Vide, { Show, values } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { ActionInspector } from "app/components/action-inspector";
import { Card } from "app/components/card";
import { EmptyState } from "app/components/empty-state";
import { atoms } from "atoms/atoms";
import { selectedAtomId } from "atoms/inspector";

export function Inspector() {
	const atomsState = useAtom(atoms);
	const selected = useAtom(selectedAtomId);

	const selectedAtom = () => {
		const id = selected();
		if (id === undefined) return undefined;
		return atomsState().find((action) => action.atomId === id);
	};

	return (
		<frame Name="Inspector" Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} BorderSizePixel={0}>
			{values(
				() => {
					const action = selectedAtom();
					return action !== undefined ? [action] : [];
				},
				(action) => (
					<ActionInspector action={action} />
				),
			)}
			<Show when={() => selectedAtom() === undefined}>
				{() => (
					<Card name="Empty">
						<EmptyState text="Select an atom to inspect its value" />
					</Card>
				)}
			</Show>
		</frame>
	);
}
