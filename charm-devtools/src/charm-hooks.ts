import type { Atom, Getter, Update } from "@rbxts/charm";
import * as Charm from "@rbxts/charm";
import { HttpService } from "@rbxts/services";
import { logger } from "logger";
import type { SourceLocation } from "protocol";
import { wrapAtom } from "wrap-atom";

// biome-ignore lint/suspicious/noExplicitAny: accepts any atom
type AnyAtom = Atom<any>;

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
};

type CharmModule = typeof Charm;
type MutableCharm = { -readonly [K in keyof CharmModule]: CharmModule[K] };

const charm = Charm as unknown as MutableCharm;

export const original = {
	atom: Charm.atom,
	computed: Charm.computed,
	effect: Charm.effect,
	untracked: Charm.untracked,
	listen: Charm.listen,
	subscribe: Charm.subscribe,
} as const;

const hooks: CharmHooks[] = [];
const atomInfos = setmetatable(new Map<AnyAtom, AtomInfo>(), { __mode: "k" });

let installed = false;

function now() {
	return DateTime.now().UnixTimestampMillis / 1000;
}

const PACKAGE_SOURCE = script.Parent?.GetFullName() ?? "";

function isPackageSource(source: string) {
	return source === PACKAGE_SOURCE || source.sub(1, PACKAGE_SOURCE.size() + 1) === `${PACKAGE_SOURCE}.`;
}

export function getCallerSource(): SourceLocation | undefined {
	let level = 1;

	while (true) {
		if (level > 100) {
			logger.warn("getCallerSource() exceeded 100 stack frames, returning undefined");
			return undefined;
		}

		const [source, line] = debug.info(level++, "sl");
		if (source === undefined) return undefined;
		if (source === "[C]" || isPackageSource(source)) continue;
		return { script: source, line };
	}
}

export function formatSource(source: SourceLocation | undefined): string {
	return source !== undefined ? `${source.script}:${source.line}` : "unknown";
}

export function getCallerTrace(): string {
	return formatSource(getCallerSource());
}

function createInfo(): NodeInfo {
	const source = getCallerSource();
	return {
		id: HttpService.GenerateGUID(false),
		trace: formatSource(source),
		source,
		createdAt: now(),
	};
}

function notify<K extends Exclude<keyof CharmHooks, "atomWrite">>(
	name: K,
	...args: Parameters<NonNullable<CharmHooks[K]>>
) {
	for (const hook of [...hooks]) {
		const callback = hook[name] as ((...args: unknown[]) => void) | undefined;
		if (callback === undefined) continue;

		const [success, err] = pcall(callback, ...(args as unknown[]));
		if (!success) {
			logger.warn(`{name} hook errored: {err}`, { name, err });
		}
	}
}

function peek<T>(atom: Atom<T>): T {
	return original.untracked(atom);
}

function hookedAtom<T>(initialValue: T, equals?: Charm.Equals<T>): Atom<T> {
	const inner = original.atom(initialValue, equals);
	const info: AtomInfo = { ...createInfo(), initialValue };

	const write = (update: Update<T>): T => {
		const previous = peek(inner);
		const middlewares: AtomWriteMiddleware[] = [];
		for (const hook of hooks) {
			if (hook.atomWrite) middlewares.push(hook.atomWrite);
		}

		const run = (index: number, current: Update<T>): unknown => {
			const middleware = middlewares[index];
			if (middleware === undefined) return inner(current);
			return middleware({ atom: wrapped, info, update: current, previous }, (nextUpdate) =>
				run(index + 1, nextUpdate as Update<T>),
			);
		};

		run(0, update);

		const value = peek(inner);
		if (value !== previous) {
			notify("atomChanged", wrapped, value, previous, info);
		}

		return value;
	};

	const wrapped = wrapAtom(inner, write);
	atomInfos.set(wrapped, info);
	notify("atomCreated", wrapped, info);

	return wrapped;
}

function hookedComputed<T>(getter: (previousValue?: T) => T): Getter<T> {
	const computed = original.computed(getter);
	notify("computedCreated", computed as Getter<unknown>, createInfo());
	return computed;
}

// biome-ignore lint/suspicious/noConfusingVoidType: matches Charm's effect signature
function hookedEffect(fn: () => Cleanup | void): Cleanup {
	const info = createInfo();
	const dispose = original.effect(fn);
	let disposed = false;

	const hookedDispose = () => {
		dispose();
		if (disposed) return;
		disposed = true;
		notify("effectDisposed", info);
	};

	notify("effectCreated", hookedDispose, info);
	return hookedDispose;
}

export function installCharmHooks() {
	assert(!installed, "Charm hooks already installed");
	installed = true;

	charm.atom = hookedAtom as CharmModule["atom"];
	charm.computed = hookedComputed;
	charm.effect = hookedEffect;
}

export function uninstallCharmHooks() {
	assert(installed, "Charm hooks not installed");
	installed = false;

	charm.atom = original.atom;
	charm.computed = original.computed;
	charm.effect = original.effect;
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

export function getAtomInfo(atom: AnyAtom): AtomInfo | undefined {
	return atomInfos.get(atom);
}

export function getHookedAtoms(): ReadonlyMap<AnyAtom, AtomInfo> {
	return atomInfos;
}

export function setAtomLabel(atom: AnyAtom, label: string) {
	const info = atomInfos.get(atom);
	if (info) info.label = label;
}
