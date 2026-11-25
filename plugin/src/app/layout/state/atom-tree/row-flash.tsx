import { TweenService } from "@rbxts/services";
import Vide, { cleanup, effect, untrack } from "@rbxts/vide";
import { udim } from "app/hooks/use-px";
import { THEME } from "constants/theme";
import { FLASH_DURATION, FLASH_START_TRANSPARENCY } from "./types";

// rows are recycled (and reordered when sorting by recent), so resume the flash from the atom's update time instead of tracking changes per row
export function RowFlash(props: { updatedAt: () => number | undefined }) {
	const flash = (
		<frame
			Name="Flash"
			Size={UDim2.fromScale(1, 1)}
			BackgroundColor3={THEME.accent}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			ZIndex={0}
		>
			<uicorner CornerRadius={udim(0, 4)} />
		</frame>
	) as Frame;

	let flashTween: Tween | undefined;
	cleanup(() => flashTween?.Cancel());

	effect(() => {
		const updatedAt = props.updatedAt();

		untrack(() => {
			flashTween?.Cancel();
			const elapsed = updatedAt !== undefined ? os.clock() - updatedAt : FLASH_DURATION;
			if (elapsed >= FLASH_DURATION) {
				flash.BackgroundTransparency = 1;
				return;
			}

			const progress = elapsed / FLASH_DURATION;
			flash.BackgroundTransparency = FLASH_START_TRANSPARENCY + (1 - FLASH_START_TRANSPARENCY) * progress;
			flashTween = TweenService.Create(flash, new TweenInfo(FLASH_DURATION - elapsed, Enum.EasingStyle.Linear), {
				BackgroundTransparency: 1,
			});
			flashTween.Play();
		});
	});

	return flash;
}
