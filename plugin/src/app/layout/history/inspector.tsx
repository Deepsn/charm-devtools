import Vide, { Show, values } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { ActionInspector } from "app/components/action-inspector";
import { EmptyState } from "app/components/empty-state";
import { history } from "atoms/history";
import { selectedActionId } from "atoms/inspector";
import { THEME } from "constants/theme";

export function Inspector() {
	const selected = useAtom(selectedActionId);
	const historyState = useAtom(history);

	const selectedAction = () => {
		const id = selected();
		if (id === undefined) return undefined;
		return historyState().find((action) => action.id === id);
	};

	return (
		<frame Name="Inspector" Size={UDim2.fromScale(1, 1)} BackgroundColor3={THEME.windowBg} BorderSizePixel={0}>
			{values(
				() => {
					const action = selectedAction();
					return action !== undefined ? [action] : [];
				},
				(action) => (
					<ActionInspector action={action} />
				),
			)}
			<Show when={() => selectedAction() === undefined}>
				{() => <EmptyState text="Select an action to inspect its payload" />}
			</Show>
		</frame>
	);
}
