import { Workspace } from "@rbxts/services";
import { cleanup, source } from "@rbxts/vide";

export function useCamera() {
	const camera = source<Camera | undefined>(Workspace.CurrentCamera);

	cleanup(
		Workspace.GetPropertyChangedSignal("CurrentCamera").Connect(() => {
			camera(Workspace.CurrentCamera);
		}),
	);

	return camera;
}
