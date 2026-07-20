import Vide from "@rbxts/vide";
import { Card } from "app/components/card";
import { EmptyState } from "app/components/empty-state";

export function Settings() {
	return (
		<Card name="Settings" padding={10}>
			<EmptyState text="Settings will go here" />
		</Card>
	);
}
