import type { SourceLocation } from "protocol";

export type GraphNodeKind = "atom" | "computed" | "effect" | "listener";

export type GraphNodeInfo = {
	id: string;
	trace: string;
	source?: SourceLocation;
	label?: string;
};

export type GraphNode = {
	kind: GraphNodeKind;
	info: GraphNodeInfo;
	deps: Set<GraphNode>;
	subs: Set<GraphNode>;
	writes: Set<GraphNode>;
	children: Set<GraphNode>;
	owners: Set<GraphNode>;
};

export type DependentNode = {
	kind: GraphNodeKind;
	info: GraphNodeInfo;
	depth: number;
};

export type TrackMode = "reads" | "writes" | "both" | "appendWrites";

type Frame = {
	node: GraphNode;
	staleDeps?: Set<GraphNode>;
	staleWrites?: Set<GraphNode>;
};

let frame: Frame | undefined;
let onChange: (() => void) | undefined;
let changeScheduled = false;

function weakSet() {
	return setmetatable(new Set<GraphNode>(), { __mode: "k" });
}

function copy(nodes: Set<GraphNode>) {
	const result = new Set<GraphNode>();
	for (const node of nodes) result.add(node);
	return result;
}

function changed() {
	if (changeScheduled || !onChange) return;
	changeScheduled = true;

	task.defer(() => {
		changeScheduled = false;
		onChange?.();
	});
}

export function setGraphChangedCallback(callback: (() => void) | undefined) {
	onChange = callback;
}

export function createNode(kind: GraphNodeKind, info: GraphNodeInfo): GraphNode {
	const node: GraphNode = {
		kind,
		info,
		deps: weakSet(),
		subs: weakSet(),
		writes: weakSet(),
		children: weakSet(),
		owners: weakSet(),
	};

	const owner = frame?.node;
	if (owner && kind !== "atom") {
		owner.children.add(node);
		node.owners.add(owner);
		changed();
	}

	return node;
}

function removeStaleEdges({ node, staleDeps = new Set<GraphNode>(), staleWrites = new Set<GraphNode>() }: Frame) {
	for (const dep of staleDeps) {
		node.deps.delete(dep);
		dep.subs.delete(node);
	}

	for (const target of staleWrites) node.writes.delete(target);

	if (!staleDeps.isEmpty() || !staleWrites.isEmpty()) changed();
}

function run<T>(current: Frame | undefined, fn: () => T): T {
	const previous = frame;
	frame = current;
	const [success, result] = pcall(fn);
	frame = previous;

	if (current) removeStaleEdges(current);
	if (!success) error(result, 0);
	return result as T;
}

export function track<T>(node: GraphNode, mode: TrackMode, fn: () => T): T {
	const current: Frame = { node };
	if (mode === "reads" || mode === "both") current.staleDeps = copy(node.deps);
	if (mode === "writes" || mode === "both") current.staleWrites = copy(node.writes);
	if (mode === "appendWrites") current.staleWrites = new Set();

	return run(current, fn);
}

export function withoutDependencyTracking<T>(fn: () => T): T {
	return run(undefined, fn);
}

export function recordRead(dep: GraphNode) {
	if (!frame?.staleDeps || frame.node === dep) return;

	if (frame.node.deps.has(dep)) {
		frame.staleDeps.delete(dep);
	} else {
		frame.node.deps.add(dep);
		dep.subs.add(frame.node);
		changed();
	}
}

export function recordWrite(target: GraphNode) {
	if (!frame?.staleWrites || frame.node === target) return;

	if (frame.node.writes.has(target)) {
		frame.staleWrites.delete(target);
	} else {
		frame.node.writes.add(target);
		changed();
	}
}

export function removeNode(node: GraphNode) {
	const edges = [node.deps, node.subs, node.writes, node.children, node.owners];
	const hadEdges = edges.some((nodes) => !nodes.isEmpty());

	for (const dep of node.deps) dep.subs.delete(node);
	for (const sub of node.subs) sub.deps.delete(node);
	for (const child of node.children) child.owners.delete(node);
	for (const owner of node.owners) owner.children.delete(node);
	for (const nodes of edges) nodes.clear();

	if (hadEdges) changed();
}

export function collectDependents(root: GraphNode): DependentNode[] {
	const visited = new Set([root]);
	const dependents: DependentNode[] = [];
	let layer = [root];

	for (let depth = 1; !layer.isEmpty(); depth++) {
		const nextLayer: GraphNode[] = [];

		for (const node of layer) {
			for (const edges of [node.subs, node.writes, node.children]) {
				for (const dependent of edges) {
					if (visited.has(dependent)) continue;

					visited.add(dependent);
					nextLayer.push(dependent);
					dependents.push({ kind: dependent.kind, info: dependent.info, depth });
				}
			}
		}

		layer = nextLayer;
	}

	return dependents;
}
