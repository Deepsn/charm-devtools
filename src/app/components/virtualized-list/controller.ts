export type DataSourceCursor<T extends defined> = {
	before: () => DataSourceCursor<T> | undefined;
	value: T;
	after: () => DataSourceCursor<T> | undefined;
};

export type DataSource<T extends defined> =
	| {
			type: "array";
			array: T[];
	  }
	| {
			type: "mutableSource";
			methods: MutableDataSourceMethods<T>;
	  };

export type MutableDataSourceMethods<T extends defined> = {
	get: (startIndex: number) => DataSourceCursor<T> | undefined;
	length: () => number;
	bindToChanged: (callback: () => void) => () => void;
	back?: () => T | undefined;
	getByRange?: (startIndex: number, endIndex: number) => T[];
};

export type Dimensions<T extends defined> =
	| {
			type: "getter";
			callback: (value: T, index: number) => UDimRect;
	  }
	| {
			type: "consistentSize";
			size: number;
	  }
	| {
			type: "consistentUDim2";
			udim2: UDim2;
	  }
	| {
			type: "spaced";
			spacing: number;
			inner: Dimensions<T>;
	  };

export type UDimRect = {
	size: UDim2;
	position: UDim2;
};

export type VirtualizedListController<T extends defined> = ReturnType<typeof createVirtualizedListController<T>>;

type CurrentView<T extends defined> = {
	range: Vector3;
	canvasSize: UDim2;
	windowSize: Vector2;
	lastDimensions: Dimensions<T>;
	cachedLastResult: T[];
	offsetBoundaries?: Vector3;
	dataSource: DataSource<T>;
	dataSourceLength: number;
};

function getDataSourceCursor<T extends defined>(
	dataSource: DataSource<T>,
	startIndex: number,
): DataSourceCursor<T> | undefined {
	assert(startIndex >= 1, "index < 1");

	if (dataSource.type === "array") {
		const getCursor = (index: number): DataSourceCursor<T> | undefined => {
			if (index < 1 || index > dataSource.array.size()) {
				return undefined;
			}

			return {
				before: () => getCursor(index - 1),
				value: dataSource.array[index - 1],
				after: () => getCursor(index + 1),
			};
		};

		return getCursor(startIndex);
	}

	return dataSource.methods.get(startIndex);
}

function getDataSourceLength<T extends defined>(dataSource: DataSource<T>): number {
	if (dataSource.type === "array") {
		return dataSource.array.size();
	}

	return dataSource.methods.length();
}

function getDataSourceBack<T extends defined>(dataSource: DataSource<T>): T | undefined {
	if (dataSource.type === "array") {
		return dataSource.array[dataSource.array.size() - 1];
	}

	if (dataSource.methods.back !== undefined) {
		return dataSource.methods.back();
	}

	const cursor = dataSource.methods.get(dataSource.methods.length());
	return cursor?.value;
}

function getDataSourceByRange<T extends defined>(dataSource: DataSource<T>, range: Vector3): T[] {
	if (dataSource.type === "array") {
		const items: T[] = [];
		for (let index = range.X; index <= range.Y; index += 1) {
			items.push(dataSource.array[index - 1]);
		}

		return items;
	}

	if (dataSource.methods.getByRange !== undefined) {
		return dataSource.methods.getByRange(range.X, range.Y);
	}

	const items: T[] = [];
	let cursor = dataSource.methods.get(range.X);

	for (let index = 0; index <= range.Y - range.X; index += 1) {
		if (cursor === undefined) {
			break;
		}

		items.push(cursor.value);
		cursor = cursor.after();
	}

	return items;
}

function dataSourceEquals<T extends defined>(left: DataSource<T>, right: DataSource<T>): boolean {
	if (left.type !== right.type) {
		return false;
	}

	if (left.type === "array" && right.type === "array") {
		return left.array === right.array;
	}

	if (left.type === "mutableSource" && right.type === "mutableSource") {
		return left.methods === right.methods;
	}

	return false;
}

function getAmountPerNonDominantInGrid(udim2: UDim2, windowSize: Vector2, direction: "x" | "y"): number {
	if (direction === "x") {
		return math.floor(windowSize.Y / (udim2.Y.Offset + udim2.Y.Scale * windowSize.Y));
	}

	return math.floor(windowSize.X / (udim2.X.Offset + udim2.X.Scale * windowSize.X));
}

function getDominantAxis(vector: Vector2, direction: "x" | "y"): number {
	return direction === "x" ? vector.X : vector.Y;
}

export function adjustPositionToScrollAxis(position: UDim2, scrollAxis: number, direction: "x" | "y"): UDim2 {
	if (direction === "x") {
		return new UDim2(0, position.X.Offset - scrollAxis, position.Y.Scale, position.Y.Offset);
	}

	return new UDim2(position.X.Scale, position.X.Offset, 0, position.Y.Offset - scrollAxis);
}

export function getUDimRect<T extends defined>(
	dimensions: Dimensions<T>,
	item: T,
	index: number,
	windowSize: Vector2,
	direction: "x" | "y",
): UDimRect {
	if (dimensions.type === "consistentSize") {
		return {
			size: direction === "x" ? new UDim2(0, dimensions.size, 1, 0) : new UDim2(1, 0, 0, dimensions.size),
			position:
				direction === "x"
					? UDim2.fromOffset(dimensions.size * (index - 1), 0)
					: UDim2.fromOffset(0, dimensions.size * (index - 1)),
		};
	}

	if (dimensions.type === "consistentUDim2") {
		const amountPerNonDominant = getAmountPerNonDominantInGrid(dimensions.udim2, windowSize, direction);
		return {
			size: dimensions.udim2,
			position:
				direction === "x"
					? new UDim2(
							0,
							(math.ceil(index / amountPerNonDominant) - 1) * dimensions.udim2.X.Offset,
							dimensions.udim2.Y.Scale * ((index - 1) % amountPerNonDominant),
							dimensions.udim2.Y.Offset * ((index - 1) % amountPerNonDominant),
						)
					: new UDim2(
							dimensions.udim2.X.Scale * ((index - 1) % amountPerNonDominant),
							dimensions.udim2.X.Offset * ((index - 1) % amountPerNonDominant),
							0,
							(math.ceil(index / amountPerNonDominant) - 1) * dimensions.udim2.Y.Offset,
						),
		};
	}

	if (dimensions.type === "getter") {
		return dimensions.callback(item, index);
	}

	if (dimensions.inner.type === "consistentSize") {
		return {
			size: direction === "x" ? new UDim2(0, dimensions.inner.size, 1, 0) : new UDim2(1, 0, 0, dimensions.inner.size),
			position:
				direction === "x"
					? UDim2.fromOffset((dimensions.inner.size + dimensions.spacing) * (index - 1), 0)
					: UDim2.fromOffset(0, (dimensions.inner.size + dimensions.spacing) * (index - 1)),
		};
	}

	if (dimensions.inner.type === "consistentUDim2") {
		const inner = dimensions.inner.udim2;
		const spaced = new UDim2(
			inner.X.Scale,
			inner.X.Offset + (direction === "x" ? dimensions.spacing : 0),
			inner.Y.Scale,
			inner.Y.Offset + (direction === "y" ? dimensions.spacing : 0),
		);
		const amountPerNonDominant = getAmountPerNonDominantInGrid(spaced, windowSize, direction);

		return {
			size: dimensions.inner.udim2,
			position:
				direction === "x"
					? new UDim2(
							0,
							(math.ceil(index / amountPerNonDominant) - 1) * spaced.X.Offset,
							spaced.Y.Scale * ((index - 1) % amountPerNonDominant),
							spaced.Y.Offset * ((index - 1) % amountPerNonDominant),
						)
					: new UDim2(
							spaced.X.Scale * ((index - 1) % amountPerNonDominant),
							spaced.X.Offset * ((index - 1) % amountPerNonDominant),
							0,
							(math.ceil(index / amountPerNonDominant) - 1) * spaced.Y.Offset,
						),
		};
	}

	throw "Unsupported spaced dimensions";
}

function getCanvasSize<T extends defined>(
	dimensions: Dimensions<T>,
	dataSource: DataSource<T>,
	windowSize: Vector2,
	direction: "x" | "y",
): UDim2 {
	const back = getDataSourceBack(dataSource);
	if (back === undefined) {
		return UDim2.fromScale(0, 0);
	}

	const udimRect = getUDimRect(dimensions, back, getDataSourceLength(dataSource), windowSize, direction);
	return direction === "x"
		? UDim2.fromOffset(udimRect.position.X.Offset + udimRect.size.X.Offset, 0)
		: UDim2.fromOffset(0, udimRect.position.Y.Offset + udimRect.size.Y.Offset);
}

function dimensionsEquals<T extends defined>(left: Dimensions<T>, right: Dimensions<T>): boolean {
	if (left.type !== right.type) {
		return false;
	}

	if (left.type === "getter" && right.type === "getter") {
		return left.callback === right.callback;
	}

	if (left.type === "consistentSize" && right.type === "consistentSize") {
		return left.size === right.size;
	}

	if (left.type === "consistentUDim2" && right.type === "consistentUDim2") {
		return left.udim2 === right.udim2;
	}

	if (left.type === "spaced" && right.type === "spaced") {
		return left.spacing === right.spacing;
	}

	return false;
}

function binarySearchIndexRangeInView<T extends defined>(
	dataSource: DataSource<T>,
	getUDimRectForItem: (value: T, index: number) => UDimRect,
	scrollAxis: number,
	windowAxis: number,
	direction: "x" | "y",
): Vector3 {
	type Comparison = "before" | "inside" | "after";

	function compareInView(udimRect: UDimRect): Comparison {
		const position = direction === "x" ? udimRect.position.X.Offset : udimRect.position.Y.Offset;
		const size = direction === "x" ? udimRect.size.X.Offset : udimRect.size.Y.Offset;

		if (position + size < scrollAxis) {
			return "before";
		}

		if (position > scrollAxis + windowAxis) {
			return "after";
		}

		return "inside";
	}

	let low = 1;
	const length = getDataSourceLength(dataSource);
	let high = length;

	while (low <= high) {
		const mid = math.floor((low + high) / 2);
		const cursor = getDataSourceCursor(dataSource, mid);
		assert(cursor !== undefined, "get() returned nil, meaning the length is inaccurate");

		const cursorUDimRect = getUDimRectForItem(cursor.value, mid);
		const comparison = compareInView(cursorUDimRect);

		if (comparison === "after") {
			high = mid - 1;
		} else if (comparison === "before") {
			low = mid + 1;
		} else {
			let min = mid;
			let minCursor = cursor;

			while (min > 1) {
				const nextCursor = minCursor.before();
				if (nextCursor === undefined) {
					break;
				}

				if (compareInView(getUDimRectForItem(nextCursor.value, min - 1)) !== "inside") {
					break;
				}

				min -= 1;
				minCursor = nextCursor;
			}

			let max = mid;
			let maxCursor = cursor;

			while (max < length) {
				const nextCursor = maxCursor.after();
				if (nextCursor === undefined) {
					break;
				}

				if (compareInView(getUDimRectForItem(nextCursor.value, max + 1)) !== "inside") {
					break;
				}

				max += 1;
				maxCursor = nextCursor;
			}

			return new Vector3(min, max, 0);
		}
	}

	return new Vector3(0, 0, 0);
}

export function createVirtualizedListController<T extends defined>(
	dataSource: DataSource<T>,
	dimensions: Dimensions<T>,
	direction: "x" | "y",
) {
	let currentView: CurrentView<T> = {
		range: new Vector3(0, 0, 0),
		canvasSize: UDim2.fromScale(0, 0),
		windowSize: new Vector2(0, 0),
		lastDimensions: dimensions,
		cachedLastResult: [] as T[],
		dataSource,
		dataSourceLength: 0,
	};

	let scrollAxis = 0;
	let windowAxis = 0;
	let windowSize = new Vector2(0, 0);
	const callbacks = new Set<() => void>();

	function getIndexRangeInViewForSize(size: number): Vector3 {
		const head = 1 + math.floor(scrollAxis / size);
		const tail = 1 + math.floor((scrollAxis + windowAxis) / size);

		return new Vector3(head, tail, 0);
	}

	function getIndexRangeInViewForUDim2(udim2: UDim2): Vector3 {
		const amountPerNonDominant = getAmountPerNonDominantInGrid(udim2, windowSize, direction);
		const dominantSize = direction === "x" ? udim2.X.Offset : udim2.Y.Offset;

		const head = 1 + math.floor(scrollAxis / dominantSize) * amountPerNonDominant;
		const tail = (1 + math.floor((scrollAxis + windowAxis) / dominantSize)) * amountPerNonDominant;

		return new Vector3(head, tail, 0);
	}

	function getIndexRangeInView(): Vector3 {
		if (dimensions.type === "consistentUDim2") {
			return getIndexRangeInViewForUDim2(dimensions.udim2);
		}

		if (dimensions.type === "consistentSize") {
			return getIndexRangeInViewForSize(dimensions.size);
		}

		if (dimensions.type === "getter") {
			return binarySearchIndexRangeInView(dataSource, dimensions.callback, scrollAxis, windowAxis, direction);
		}

		if (dimensions.inner.type === "consistentSize") {
			return getIndexRangeInViewForSize(dimensions.inner.size + dimensions.spacing);
		}

		if (dimensions.inner.type === "consistentUDim2") {
			const inner = dimensions.inner.udim2;
			const spaced = new UDim2(
				inner.X.Scale,
				inner.X.Offset + (direction === "x" ? dimensions.spacing : 0),
				inner.Y.Scale,
				inner.Y.Offset + (direction === "y" ? dimensions.spacing : 0),
			);

			return getIndexRangeInViewForUDim2(spaced);
		}

		throw "Unsupported spaced dimensions";
	}

	function callUpdateCallbacks() {
		for (const callback of callbacks) {
			callback();
		}
	}

	function update() {
		const length = getDataSourceLength(dataSource);

		if (
			currentView.offsetBoundaries !== undefined &&
			currentView.offsetBoundaries.X <= scrollAxis &&
			currentView.offsetBoundaries.Y >= windowAxis + scrollAxis &&
			currentView.windowSize === windowSize &&
			currentView.dataSource === dataSource &&
			currentView.dataSourceLength === length &&
			currentView.lastDimensions === dimensions
		) {
			return;
		}

		const newIndexRange = getIndexRangeInView();
		const items = getDataSourceByRange(dataSource, newIndexRange);

		if (items.size() === 0) {
			currentView = {
				range: newIndexRange,
				canvasSize: UDim2.fromScale(0, 0),
				windowSize,
				lastDimensions: dimensions,
				cachedLastResult: [] as T[],
				offsetBoundaries: new Vector3(scrollAxis, windowAxis + scrollAxis, 0),
				dataSource,
				dataSourceLength: length,
			};

			callUpdateCallbacks();
			return;
		}

		const firstItem = items[0];
		const lastItem = items[items.size() - 1];
		const topDimensions = getUDimRect(dimensions, firstItem, newIndexRange.X, windowSize, direction);
		const bottomDimensions = getUDimRect(dimensions, lastItem, newIndexRange.Y, windowSize, direction);

		currentView = {
			range: newIndexRange,
			canvasSize: getCanvasSize(),
			windowSize,
			lastDimensions: dimensions,
			cachedLastResult: items,
			offsetBoundaries: new Vector3(
				direction === "x" ? topDimensions.position.X.Offset : topDimensions.position.Y.Offset,
				direction === "x"
					? bottomDimensions.position.X.Offset + bottomDimensions.size.X.Offset
					: bottomDimensions.position.Y.Offset + bottomDimensions.size.Y.Offset,
				0,
			),
			dataSource,
			dataSourceLength: length,
		};

		callUpdateCallbacks();
	}

	function setScrollAxis(newScrollAxis: number) {
		scrollAxis = newScrollAxis;
		update();
	}

	function setDataSource(newDataSource: DataSource<T>) {
		assert(dataSource.type === newDataSource.type, "Data source type changed, you must keep it the same");

		if (dataSourceEquals(dataSource, newDataSource)) {
			return;
		}

		dataSource = newDataSource;
		update();
	}

	function setDimensions(newDimensions: Dimensions<T>) {
		if (dimensionsEquals(dimensions, newDimensions)) {
			return;
		}

		dimensions = newDimensions;
		update();
	}

	function setWindowSize(newWindowSize: Vector2) {
		if (windowSize === newWindowSize) {
			return;
		}

		windowSize = newWindowSize;
		windowAxis = getDominantAxis(newWindowSize, direction);
		update();
	}

	function getWindowSize() {
		return windowSize;
	}

	function get() {
		return currentView.cachedLastResult;
	}

	function getCanvasSize() {
		return currentView.canvasSize;
	}

	function getRange() {
		return currentView.range;
	}

	function bindToUpdate(callback: () => void) {
		callbacks.add(callback);
		return () => {
			callbacks.delete(callback);
		};
	}

	const disconnectMutableSourceUpdate =
		dataSource.type === "mutableSource" ? dataSource.methods.bindToChanged(update) : undefined;

	function destroy() {
		disconnectMutableSourceUpdate?.();
		callbacks.clear();
	}

	return {
		setScrollAxis,
		setWindowSize,
		getWindowSize,
		setDataSource,
		setDimensions,
		get,
		getCanvasSize,
		getRange,
		bindToUpdate,
		destroy,
	};
}

export default createVirtualizedListController;
