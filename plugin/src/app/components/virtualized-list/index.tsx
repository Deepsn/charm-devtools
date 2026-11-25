import Vide, { cleanup, type Derivable, effect, indexes, read, source } from "@rbxts/vide";
import createVirtualizedListController, {
	type DataSource,
	type Dimensions,
	getUDimRect,
} from "app/components/virtualized-list/controller";
import type { ScrollControl } from "app/components/virtualized-list/scroll-control";
import { px } from "app/hooks/use-px";

/** `rowHeight`, `spacing` and `ScrollBarThickness` are unscaled design pixels; the list applies `px` itself. */
export interface VirtualizedListProps<T extends defined> {
	rowHeight: Derivable<number>;
	spacing?: Derivable<number>;

	items: () => readonly T[];
	render: (value: () => T, index: () => number) => Vide.Node;

	Size?: Derivable<UDim2>;
	Position?: Derivable<UDim2>;
	BackgroundColor3?: Derivable<Color3>;
	BackgroundTransparency?: Derivable<number>;
	ScrollBarThickness?: Derivable<number>;
	ScrollBarImageColor3?: Derivable<Color3>;
	ScrollBarImageTransparency?: number;

	scrollControl?: ScrollControl;
}

type Slot<T> = { value: T; index: number };

export function VirtualizedList<T extends defined>(props: VirtualizedListProps<T>) {
	const direction = "y" as const;

	const windowSize = source(Vector2.zero);
	const slots = source<Slot<T>[]>([]);
	const canvasSize = source(UDim2.fromScale(0, 0));

	const buildDimensions = (): Dimensions<T> => ({
		type: "spaced",
		spacing: px(read(props.spacing) ?? 0)(),
		inner: { type: "consistentSize", size: px(read(props.rowHeight))() },
	});

	const dimensions = source<Dimensions<T>>(buildDimensions());

	const initialSource: DataSource<T> = { type: "array", array: [] };
	const controller = createVirtualizedListController<T>(initialSource, dimensions(), direction);
	cleanup(controller.destroy);

	cleanup(
		controller.bindToUpdate(() => {
			const items = controller.get();
			const range = controller.getRange();

			const rows: Slot<T>[] = [];
			for (const [relativeIndex, item] of ipairs(items)) {
				if (item === undefined) continue;
				rows.push({ value: item, index: range.X + (relativeIndex - 1) });
			}

			slots(rows);
			canvasSize(controller.getCanvasSize());
		}),
	);

	effect(() => {
		const nextDimensions = buildDimensions();
		dimensions(nextDimensions);
		controller.setDimensions(nextDimensions);
	});

	effect(() => {
		const items = props.items();
		controller.setDataSource({ type: "array", array: [...items] });
	});

	return (
		<scrollingframe
			Name="VirtualizedList"
			Size={props.Size ?? UDim2.fromScale(1, 1)}
			Position={props.Position ?? UDim2.fromScale(0, 0)}
			BackgroundColor3={props.BackgroundColor3 ?? new Color3()}
			BackgroundTransparency={props.BackgroundTransparency ?? 1}
			BorderSizePixel={0}
			CanvasSize={canvasSize}
			ScrollingDirection={Enum.ScrollingDirection.Y}
			ScrollBarThickness={() => px(read(props.ScrollBarThickness) ?? 8)()}
			ScrollBarImageColor3={props.ScrollBarImageColor3 ?? new Color3()}
			ScrollBarImageTransparency={props.ScrollBarImageTransparency ?? 0}
			AbsoluteWindowSizeChanged={(size) => {
				windowSize(size);
				controller.setWindowSize(size);
			}}
			CanvasPositionChanged={(position) => controller.setScrollAxis(direction === "y" ? position.Y : position.X)}
			CanvasPosition={() => props.scrollControl?.getCanvasPosition() ?? Vector2.zero}
			action={
				props.scrollControl
					? (scrollingFrame) => {
							props.scrollControl?.setScrollingFrame(scrollingFrame);
						}
					: undefined
			}
		>
			{indexes(slots, (slot) => {
				const rect = () => getUDimRect(dimensions(), slot().value, slot().index, windowSize(), direction);

				return (
					<frame
						Name="Row"
						Size={() => rect().size}
						Position={() => rect().position}
						BackgroundTransparency={1}
						BorderSizePixel={0}
					>
						{props.render(
							() => slot().value,
							() => slot().index,
						)}
					</frame>
				);
			})}
		</scrollingframe>
	);
}
