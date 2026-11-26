import type { Atom, Equals, Getter, Update } from "@rbxts/charm";
import * as Charm from "@rbxts/charm";
import { HttpService } from "@rbxts/services";
import { formatSource, getCallerSource } from "caller-source";
import { now } from "clock";
import {
	collectDependents,
	createNode,
	type GraphNode,
	type GraphNodeKind,
	recordRead,
	recordWrite,
	removeNode,
	setGraphChangedCallback,
	track,
	withoutDependencyTracking,
} from "graph";
import { logger } from "logger";
import type { SourceLocation } from "protocol";
import { wrapAtom } from "wrap-atom";

// biome-ignore lint/suspicious/noExplicitAny: accepts any atom
export type AnyAtom = Atom<any>;
type Cleanup = () => void;

export type NodeInfo = {
	id: string;
	trace: string;
	source?: SourceLocation;
	createdAt: number;
};

export type AtomInfo = NodeInfo & {
	label?: string;
	initialValue: unknown;
};

export type AtomWriteContext = {
	atom: AnyAtom;
	info: AtomInfo;
	update: Update<unknown>;
	previous: unknown;
};

export type AtomWriteMiddleware = (context: AtomWriteContext, next: (update: Update<unknown>) => unknown) => unknown;

export type CharmHooks = {
	atomCreated?: (atom: AnyAtom, info: AtomInfo) => void;
	atomWrite?: AtomWriteMiddleware;
	atomChanged?: (atom: AnyAtom, value: unknown, previous: unknown, info: AtomInfo) => void;
	computedCreated?: (getter: Getter<unknown>, info: NodeInfo) => void;
	effectCreated?: (dispose: Cleanup, info: NodeInfo) => void;
	effectDisposed?: (info: NodeInfo) => void;
	dependenciesChanged?: () => void;
};

export type DependentInfo = {
	kind: GraphNodeKind;
	info: NodeInfo & { label?: string };
	depth: number;
};

const charm = Charm as unknown as Record<string, unknown>;

export const original = {
	atom: Charm.atom,
	computed: Charm.computed,
	effect: Charm.effect,
	untracked: Charm.untracked,
	listen: Charm.listen,
	subscribe: Charm.subscribe,
	observe: Charm.observe,
	onCleanup: Charm.onCleanup,
	getActiveSub: Charm.getActiveSub,
} as const;

const hooks: CharmHooks[] = [];
const atomInfos = setmetatable(new Map<AnyAtom, AtomInfo>(), { __mode: "k" });
const atomNodes = setmetatable(new Map<AnyAtom, GraphNode>(), { __mode: "k" });

let installed = false;

function notify<K extends Exclude<keyof CharmHooks, "atomWrite">>(
	name: K,
	...args: Parameters<NonNullable<CharmHooks[K]>>
) {
	for (const hook of [...hooks]) {
		const callback = hook[name] as Callback | undefined;
		if (!callback) continue;

		const [success, err] = pcall(callback, ...args);
		if (!success) logger.warn("{name} hook errored: {err}", { name, err });
	}
}

function createInfo(): NodeInfo {
	const source = getCallerSource();
	return { id: HttpService.GenerateGUID(false), trace: formatSource(source), source, createdAt: now() };
}

function hookedAtom(initialValue: unknown, equals?: Equals<unknown>) {
	const inner = original.atom(initialValue, equals);
	const info: AtomInfo = { ...createInfo(), initialValue };
	const node = createNode("atom", info);

	const read = () => {
		recordRead(node);
		return inner();
	};

	const write = (update: Update<unknown>) => {
		recordWrite(node);
		const previous = original.untracked(inner);
		const middlewares = hooks.mapFiltered((hook) => hook.atomWrite);

		const run = (index: number, current: Update<unknown>): unknown => {
			const middleware = middlewares[index];
			if (!middleware) return inner(current);
			return middleware({ atom, info, update: current, previous }, (nextUpdate) => run(index + 1, nextUpdate));
		};
		run(0, update);

		const value = original.untracked(inner);
		if (value !== previous) notify("atomChanged", atom, value, previous, info);
		return value;
	};

	const atom = wrapAtom(read, write);
	atomInfos.set(atom, info);
	atomNodes.set(atom, node);
	notify("atomCreated", atom, info);

	return atom;
}

function hookedComputed(getter: (previousValue?: unknown) => unknown) {
	const info = createInfo();
	const node = createNode("computed", info);
	const inner = original.computed((previousValue) => track(node, "both", () => getter(previousValue)));

	const computedOper = () => {
		recordRead(node);
		return inner();
	};

	notify("computedCreated", computedOper, info);
	return computedOper;
}

function onEffectStopped(callback: () => void) {
	const sub = original.getActiveSub();
	if (!sub) return;

	original.onCleanup(() => {
		if (sub.flags === Charm.ReactiveFlags.None) callback();
	}, true);
}

function nodeDisposer(node: GraphNode, onDisposed?: () => void) {
	let disposed = false;

	return () => {
		if (disposed) return;
		disposed = true;
		removeNode(node);
		onDisposed?.();
	};
}

function untrackedCleanup(cleanup: Cleanup | undefined) {
	return cleanup !== undefined ? () => withoutDependencyTracking(cleanup) : undefined;
}

function hookedEffect(fn: () => Cleanup | undefined) {
	const info = createInfo();
	const node = createNode("effect", info);
	const markDisposed = nodeDisposer(node, () => notify("effectDisposed", info));

	const stop = original.effect(() => {
		onEffectStopped(markDisposed);
		return untrackedCleanup(track(node, "both", fn));
	});

	const dispose = () => {
		stop();
		markDisposed();
	};

	notify("effectCreated", dispose, info);
	return dispose;
}

function hookListener(skipFirstRun: boolean) {
	return (getter: Getter<unknown>, callback: (value: unknown, previousValue: unknown) => void) => {
		const node = createNode("listener", createInfo());
		const markDisposed = nodeDisposer(node);
		const tracked = original.computed(() => track(node, "reads", getter));
		let current: unknown;
		let skipNextRun = skipFirstRun;

		const stop = original.effect(() => {
			onEffectStopped(markDisposed);

			const previous = current;
			const value = tracked();
			current = value;

			if (skipNextRun) {
				skipNextRun = false;
				return;
			}

			original.untracked(() => track(node, "writes", () => callback(value, previous)));
		});

		return () => {
			stop();
			markDisposed();
		};
	};
}

function hookedObserve(
	getter: Getter<ReadonlyMap<unknown, unknown>>,
	callback: (value: unknown, key: unknown) => Cleanup | undefined,
) {
	const node = createNode("listener", createInfo());
	const markDisposed = nodeDisposer(node);

	const stop = original.observe(
		() => {
			onEffectStopped(markDisposed);
			return track(node, "reads", getter);
		},
		(value, key) => untrackedCleanup(track(node, "appendWrites", () => callback(value, key))),
	);

	return () => {
		stop();
		markDisposed();
	};
}

function hookedUntracked(fn: (...args: unknown[]) => unknown, ...args: unknown[]) {
	return withoutDependencyTracking(() => original.untracked(fn, ...args));
}

const hooked = {
	atom: hookedAtom,
	computed: hookedComputed,
	effect: hookedEffect,
	listen: hookListener(false),
	subscribe: hookListener(true),
	observe: hookedObserve,
	untracked: hookedUntracked,
};

export function installCharmHooks() {
	assert(!installed, "Charm hooks already installed");
	installed = true;

	for (const [name, fn] of pairs(hooked)) charm[name] = fn;
	setGraphChangedCallback(() => notify("dependenciesChanged"));
}

export function uninstallCharmHooks() {
	assert(installed, "Charm hooks not installed");
	installed = false;

	for (const [name] of pairs(hooked)) charm[name] = original[name];
	setGraphChangedCallback(undefined);
}

export function isCharmHooked() {
	return installed;
}

export function addCharmHooks(hook: CharmHooks): Cleanup {
	hooks.push(hook);

	return () => {
		const index = hooks.indexOf(hook);
		if (index !== -1) hooks.remove(index);
	};
}

export function getAtomInfo(atom: AnyAtom) {
	return atomInfos.get(atom);
}

export function getHookedAtoms(): ReadonlyMap<AnyAtom, AtomInfo> {
	return atomInfos;
}

export function getAtomDependents(atom: AnyAtom): DependentInfo[] {
	const node = atomNodes.get(atom);
	return node ? (collectDependents(node) as DependentInfo[]) : [];
}

export function setAtomLabel(atom: AnyAtom, label: string) {
	const info = atomInfos.get(atom);
	if (info) info.label = label;
}

export { withoutDependencyTracking } from "graph";
