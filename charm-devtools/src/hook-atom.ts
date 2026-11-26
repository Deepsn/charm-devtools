import { HttpService } from "@rbxts/services";
import { resolveBridge } from "bridge";
import { formatSource, getCallerSource } from "caller-source";
import {
	type AnyAtom,
	addCharmHooks,
	getAtomDependents,
	getAtomInfo,
	installCharmHooks,
	original,
	setAtomLabel,
	withoutDependencyTracking,
} from "charm-hooks";
import { now } from "clock";
import { IS_SERVER } from "constants";
import type { Action, Dependent, DependentsUpdate, SourceLocation } from "protocol";

type TrackedAtom = {
	atomId: string;
	name: string;
	source?: SourceLocation;
	mode: "auto" | "listen" | "idle";
	dispatched: boolean;
	dependentsKey: string;
};

const ENV = IS_SERVER ? "server" : "client";
const tracked = setmetatable(new Map<AnyAtom, TrackedAtom>(), { __mode: "k" });

let bridge: ReturnType<typeof resolveBridge> | undefined;
let removeCreationHooks: (() => void) | undefined;
let dependentsScheduled = false;

function nameOf(info: { label?: string; trace: string }) {
	return info.label ?? info.trace;
}

function send(payload: Action | DependentsUpdate) {
	bridge ??= resolveBridge();
	bridge.dispatch(payload);
}

function flushDependents() {
	for (const [atom, entry] of tracked) {
		if (!entry.dispatched || entry.mode === "idle") continue;

		const dependents = getAtomDependents(atom).map(
			({ kind, depth, info }): Dependent => ({ id: info.id, kind, name: nameOf(info), depth, source: info.source }),
		);
		const key = dependents.map((d) => `${d.kind}|${d.id}|${d.depth}|${d.name}`).join("\n");
		if (key === entry.dependentsKey) continue;

		entry.dependentsKey = key;
		send({ type: "dependents", atomId: entry.atomId, env: ENV, timestamp: now(), dependents });
	}
}

function scheduleDependents() {
	if (dependentsScheduled) return;
	dependentsScheduled = true;

	task.defer(() => {
		dependentsScheduled = false;
		flushDependents();
	});
}

function dispatch(entry: TrackedAtom, value: unknown) {
	if (!entry.dispatched) {
		entry.dispatched = true;
		scheduleDependents();
	}

	send({
		id: HttpService.GenerateGUID(false),
		atomId: entry.atomId,
		name: entry.name,
		value,
		env: ENV,
		timestamp: now(),
		source: entry.source,
	});
}

export function hookAtomCreation() {
	if (removeCreationHooks) return removeCreationHooks;

	installCharmHooks();

	const removeHooks = addCharmHooks({
		atomCreated: (atom, info) => {
			const entry: TrackedAtom = {
				atomId: info.id,
				name: nameOf(info),
				source: info.source,
				mode: "auto",
				dispatched: false,
				dependentsKey: "",
			};
			tracked.set(atom, entry);

			task.defer(() => {
				if (entry.mode === "auto" && !entry.dispatched) dispatch(entry, original.untracked(atom));
			});
		},

		atomChanged: (atom, value, _previous, info) => {
			const entry = tracked.get(atom);
			if (entry?.mode !== "auto") return;

			entry.name = nameOf(info);
			dispatch(entry, value);
		},

		dependenciesChanged: scheduleDependents,
	});

	removeCreationHooks = () => {
		removeHooks();
		removeCreationHooks = undefined;

		for (const [, entry] of tracked) {
			if (entry.mode === "auto") entry.mode = "idle";
		}
	};

	return removeCreationHooks;
}

export function hookAtom<T extends AnyAtom>(atom: T, options?: { label?: string }): T {
	const label = options?.label;
	if (label !== undefined) setAtomLabel(atom, label);

	const existing = tracked.get(atom);
	if (existing && existing.mode !== "idle") {
		if (label !== undefined && label !== existing.name) {
			existing.name = label;
			if (existing.dispatched) dispatch(existing, original.untracked(atom));
			scheduleDependents();
		}
		return atom;
	}

	const info = getAtomInfo(atom);
	const source = info?.source ?? getCallerSource();
	const entry: TrackedAtom = existing ?? {
		atomId: info?.id ?? HttpService.GenerateGUID(false),
		name: formatSource(source),
		source,
		mode: "listen",
		dispatched: false,
		dependentsKey: "",
	};

	if (label !== undefined) entry.name = label;
	entry.mode = "listen";
	tracked.set(atom, entry);

	withoutDependencyTracking(() => original.listen(atom, (value) => dispatch(entry, value)));
	scheduleDependents();

	return atom;
}

export function hookAtoms<T extends Record<string, AnyAtom>>(atoms: T): T {
	for (const [label, atom] of pairs(atoms)) {
		hookAtom(atom as AnyAtom, { label: label as string });
	}

	return atoms;
}
