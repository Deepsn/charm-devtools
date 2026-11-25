import { cleanup, effect, read, source } from "@rbxts/vide";
import { useCamera } from "app/hooks/use-camera";
import { logger } from "lib/logger";

export function useViewport() {
	const camera = useCamera();
	const viewportSize = source(camera()?.ViewportSize ?? new Vector2(0, 0));

	if (!read(camera)) {
		logger.warn("Camera isn't available, cannot calculate viewport size");
	}

	effect(() => {
		const cam = camera();
		if (!cam) return;

		viewportSize(cam.ViewportSize);
		cleanup(
			cam.GetPropertyChangedSignal("ViewportSize").Connect(() => {
				viewportSize(cam.ViewportSize);
			}),
		);
	});

	return viewportSize;
}
