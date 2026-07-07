import { Make } from "@rbxts/altmake";
import type { Widget, WidgetClass } from "@rbxts/iris";
import Iris from "@rbxts/iris";
import { RunService } from "@rbxts/services";
import { Trove } from "@rbxts/trove";
import createVirtualizedListController, {
	adjustPositionToScrollAxis,
	type DataSource,
	type Dimensions,
	getUDimRect,
	type VirtualizedListController,
} from "app/components/virtualized-list/controller";

export interface VirtualizedListArgs {
	Height?: number;
	RowHeight?: number;
}

type VirtualizedListWidget = Omit<Widget, "arguments"> & {
	arguments: VirtualizedListArgs;
	ChildContainer: Frame;
	Children: GuiObject[];
	Controller: VirtualizedListController<GuiObject>;
	markDirty: () => void;
	configure: (args: VirtualizedListArgs) => void;
};

function getDefaultRowHeight(): number {
	// Iris.Text is a TextLabel with a 2px vertical UIPadding on each side.
	return Iris._config.TextSize + 4;
}

function buildDimensions(rowHeight: number): Dimensions<GuiObject> {
	return {
		type: "spaced",
		spacing: Iris._config.ItemSpacing.Y,
		inner: {
			type: "consistentSize",
			size: rowHeight,
		},
	};
}

export function createVirtualizedList() {
	const virtualizedList = {
		hasState: false,
		hasChildren: true,

		Args: {
			Height: 1,
			RowHeight: 2,
		},
		Events: {},

		Generate: (thisWidget: VirtualizedListWidget) => {
			const bin = new Trove();

			const host = Make("Frame", {
				Name: "Iris_VirtualizedList",
				Size: new UDim2(Iris._config.ItemWidth, new UDim(0, 300)),
				BackgroundTransparency: 1,
				BorderSizePixel: 0,
				LayoutOrder: thisWidget.ZIndex,
			});

			const scroll = Make("ScrollingFrame", {
				Name: "Scroll",
				Size: UDim2.fromScale(1, 1),
				BackgroundColor3: Iris._config.FrameBgColor,
				BackgroundTransparency: Iris._config.FrameBgTransparency,
				BorderSizePixel: 0,
				CanvasSize: UDim2.fromScale(0, 0),
				ScrollingDirection: Enum.ScrollingDirection.Y,
				ScrollBarThickness: Iris._config.ScrollbarSize,
				ScrollBarImageColor3: Iris._config.ScrollbarGrabColor,
				ScrollBarImageTransparency: Iris._config.ScrollbarGrabTransparency,
				Parent: host,
			});

			const overlay = Make("Frame", {
				Name: "RendererOverlay",
				Position: UDim2.fromScale(0, 0),
				Size: UDim2.fromScale(1, 1),
				BackgroundTransparency: 1,
				BorderSizePixel: 0,
				ClipsDescendants: true,
				ZIndex: 2,
				Parent: host,
			});

			const container = Make("Frame", {
				Name: "ChildContainer",
				Size: UDim2.fromScale(0, 0),
				BackgroundTransparency: 1,
				BorderSizePixel: 0,
				Visible: false,
				Parent: host,
			});

			const dataSource: DataSource<GuiObject> = {
				type: "array",
				array: [],
			};

			let dimensions = buildDimensions(getDefaultRowHeight());

			const controller = bin.add(createVirtualizedListController(dataSource, dimensions, "y"));

			const mounted = new Set<GuiObject>();
			let scrollAxis = 0;
			let dirty = false;

			const reposition = () => {
				scroll.CanvasSize = controller.getCanvasSize();

				const windowSize = controller.getWindowSize();
				overlay.Size = UDim2.fromOffset(windowSize.X, windowSize.Y);

				const items = controller.get();
				const range = controller.getRange();

				const nowVisible = new Set<GuiObject>();
				for (const [relativeIndex, item] of ipairs(items)) {
					if (item === undefined) continue;

					const index = range.X + (relativeIndex - 1);
					const rect = getUDimRect(dimensions, item, index, windowSize, "y");

					item.Size = rect.size;
					item.Position = adjustPositionToScrollAxis(rect.position, scrollAxis, "y");
					if (item.Parent !== overlay) {
						item.Parent = overlay;
					}

					nowVisible.add(item);
				}

				for (const item of mounted) {
					if (!nowVisible.has(item) && item.Parent === overlay) {
						item.Parent = container;
					}
				}

				mounted.clear();
				for (const item of nowVisible) {
					mounted.add(item);
				}
			};

			bin.add(
				RunService.Heartbeat.Connect(() => {
					let changed = false;

					const windowSize = scroll.AbsoluteWindowSize;
					if (windowSize !== controller.getWindowSize()) {
						controller.setWindowSize(windowSize);
						changed = true;
					}

					const newScrollAxis = scroll.CanvasPosition.Y;
					if (newScrollAxis !== scrollAxis) {
						scrollAxis = newScrollAxis;
						controller.setScrollAxis(newScrollAxis);
						changed = true;
					}

					if (dirty) {
						dirty = false;
						controller.setDataSource({ type: "array", array: [...thisWidget.Children] });
						changed = true;
					}

					if (changed) {
						reposition();
					}
				}),
			);

			bin.add(
				host.AncestryChanged.Connect((instance, parent) => {
					if (instance !== host) return;
					if (parent) return;

					bin.destroy();
				}),
			);

			thisWidget.ChildContainer = container;
			thisWidget.Controller = controller;
			thisWidget.Children = [];
			thisWidget.markDirty = () => {
				dirty = true;
			};
			thisWidget.configure = (args: VirtualizedListArgs) => {
				host.Size = new UDim2(Iris._config.ItemWidth, new UDim(0, args.Height ?? 300));

				const rowHeight = args.RowHeight ?? getDefaultRowHeight();
				dimensions = buildDimensions(rowHeight);
				controller.setDimensions(dimensions);
			};

			return host;
		},

		Update: (thisWidget: VirtualizedListWidget) => {
			thisWidget.configure(thisWidget.arguments);
		},

		Discard: (thisWidget: VirtualizedListWidget) => {
			thisWidget.Instance.Destroy();
		},

		ChildAdded: (thisWidget: VirtualizedListWidget, child: Widget) => {
			thisWidget.Children.push(child.Instance);
			thisWidget.markDirty();
			return thisWidget.ChildContainer;
		},

		ChildDiscarded: (thisWidget: VirtualizedListWidget, child: Widget) => {
			const index = thisWidget.Children.indexOf(child.Instance);
			if (index !== -1) {
				thisWidget.Children.remove(index);
			}
			thisWidget.markDirty();
		},
	} as unknown as WidgetClass;

	Iris.Internal.WidgetConstructor("VirtualizedList", virtualizedList);

	return (args?: Array<defined>) => Iris.Internal._Insert("VirtualizedList", args);
}
