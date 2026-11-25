import { derive, effect, source } from "@rbxts/vide";
import { useViewport } from "app/hooks/use-viewport";

const BASE_RESOLUTION = new Vector2(1920, 1080);
const DOMINANT_AXIS = 0.5;
const SCALE_DAMPING = 0.75;
const MAX_ASPECT_RATIO = 16 / 9;
const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCALE_POINTS: readonly number[] = [0.5, 0.6, 0.75, 0.9, 1, 1.25, 1.5, 1.75, 2, 3];

const currentScale = source(1);

export type ViewportResolver = () => Vector2;

export interface PxOptions {
	viewport?: ViewportResolver;
	dpi?: () => number;
	userScale?: () => number;
	baseResolution?: Vector2;
	dominantAxis?: number;
	damping?: number;
	maxAspectRatio?: number;
	minScale?: number;
	maxScale?: number;
	scalePoints?: readonly number[];
}

function snapScale(scale: number, damping: number, points: readonly number[]): number {
	const adjustedScale = scale ** damping;
	let nearest = points[0];

	for (const point of points) {
		if (math.abs(point - adjustedScale) < math.abs(nearest - adjustedScale)) {
			nearest = point;
		}
	}

	return nearest;
}

export function usePx(options: PxOptions = {}) {
	const viewport = options.viewport ?? useViewport();
	const dpi = options.dpi ?? (() => 1);
	const userScale = options.userScale ?? (() => 1);
	const baseResolution = options.baseResolution ?? BASE_RESOLUTION;
	const dominantAxis = options.dominantAxis ?? DOMINANT_AXIS;
	const damping = options.damping ?? SCALE_DAMPING;
	const maxAspectRatio = options.maxAspectRatio ?? MAX_ASPECT_RATIO;
	const minScale = options.minScale ?? MIN_SCALE;
	const maxScale = options.maxScale ?? MAX_SCALE;
	const scalePoints = (options.scalePoints ?? SCALE_POINTS).filter((point) => point >= minScale && point <= maxScale);

	const constrainedViewport = derive(() => {
		const size = viewport().mul(dpi());
		const aspectRatio = math.min(size.X / size.Y, maxAspectRatio);

		return new Vector2(size.Y * aspectRatio, size.Y);
	});

	effect(() => {
		const size = constrainedViewport();
		if (size.X <= 0 || size.Y <= 0) return;

		const scaleX = math.log(size.X / baseResolution.X, 2);
		const scaleY = math.log(size.Y / baseResolution.Y, 2);
		const blendedScale = 2 ** (scaleX + (scaleY - scaleX) * dominantAxis);
		const clamped = math.clamp(blendedScale, minScale, maxScale);
		const snapped = scalePoints.isEmpty() ? clamped : snapScale(clamped, damping, scalePoints);

		currentScale(snapped * userScale());
	});
}

export function setScale(scale: number) {
	currentScale(scale);
}

export function px(value: number): () => number {
	return () => math.round(value * currentScale());
}

export function raw(scaled: number): number {
	return math.round(scaled / currentScale());
}

export function scale(value: number): () => number {
	return () => value * currentScale();
}

export function offset(x: number, y: number): () => UDim2 {
	const xPx = px(x);
	const yPx = px(y);

	return () => UDim2.fromOffset(xPx(), yPx());
}

export function udim2(xScale: number, xOffset: number, yScale: number, yOffset: number): () => UDim2 {
	const xPx = px(xOffset);
	const yPx = px(yOffset);

	return () => new UDim2(xScale, xPx(), yScale, yPx());
}

export function udim(scaleValue: number, offsetValue: number): () => UDim {
	const offsetPx = px(offsetValue);

	return () => new UDim(scaleValue, offsetPx());
}

export default px;
