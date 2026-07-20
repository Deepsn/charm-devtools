import { source } from "@rbxts/vide";

export type ScrollControl = ReturnType<typeof createScrollControl>;

export function createScrollControl() {
	const canvasPosition = source(Vector2.zero);
	let target: ScrollingFrame | undefined;

	return {
		setScrollingFrame: (scrollingFrame: ScrollingFrame) => {
			target = scrollingFrame;
			canvasPosition(scrollingFrame.CanvasPosition);
		},
		setCanvasPosition: canvasPosition,
		getCanvasPosition: () => canvasPosition(),
		getScrollingFrame: () => target,
	};
}
