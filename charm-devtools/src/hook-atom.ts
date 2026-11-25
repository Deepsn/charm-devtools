import type { Atom } from "@rbxts/charm";
import { HttpService } from "@rbxts/services";
import { resolveBridge } from "bridge";
import {
	type AtomInfo,
	addCharmHooks,
	formatSource,
	getAtomInfo,
	getCallerSource,
	installCharmHooks,
	original,
	setAtomLabel,
} from "charm-hooks";
import { IS_SERVER } from "constants";
import type { Action, SourceLocation } from "protocol";

// biome-ignore lint/suspicious/noExplicitAny: accepts any atom
type AnyAtom = Atom<any>;

type HookOptions = {
	label?: string;
};

type TrackedAtom = {
	atomId: string;
	name: string;
	source?: SourceLocation;
	dispatched: boolean;
	mode: "auto" | "listen" | "idle";
};

let bridge: ReturnType<typeof resolveBridge> | undefined;
let removeCreationHooks: (() => void) | undefined;

const tracked = setmetatable(new Map<AnyAtom, TrackedAtom>(), { __mode: "k" });

function dispatch(entry: TrackedAtom, value: unknown) {
	bridge ??= resolveBridge();
	entry.dispatched = true;

	bridge.dispatch({
		id: HttpService.GenerateGUID(false),
		atomId: entry.atomId,
		name: entry.name,
		value,
		env: IS_SERVER ? "server" : "client",
		timestamp: DateTime.now().UnixTimestampMillis / 1000,
		source: entry.source,
	} satisfies Action);
}

function nameOf(info: AtomInfo) {
	return info.label ?? info.trace;
}

export function hookAtomCreation() {
	if (removeCreationHooks) return removeCreationHooks;

	installCharmHooks();

	const remove = addCharmHooks({
		atomCreated: (atom, info) => {
			const entry: TrackedAtom = {
				atomId: info.id,
				name: nameOf(info),
				source: info.source,
				dispatched: false,
				mode: "auto",
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
	});

	removeCreationHooks = () => {
		remove();
		removeCreationHooks = undefined;
		for (const [, entry] of tracked) {
			if (entry.mode === "auto") entry.mode = "idle";
		}
	};

	return removeCreationHooks;
}

export function hookAtom<T extends AnyAtom>(atom: T, options?: HookOptions): T {
	const label = options?.label;
	const info = getAtomInfo(atom);
	if (info && label !== undefined) setAtomLabel(atom, label);

	const existing = tracked.get(atom);
	if (existing && existing.mode !== "idle") {
		if (label !== undefined && label !== existing.name) {
			existing.name = label;
			if (existing.dispatched) dispatch(existing, original.untracked(atom));
		}
		return atom;
	}

	const source = info?.source ?? getCallerSource();
	const entry: TrackedAtom = existing ?? {
		atomId: info?.id ?? HttpService.GenerateGUID(false),
		name: formatSource(source),
		source,
		dispatched: false,
		mode: "listen",
	};

	if (label !== undefined) entry.name = label;
	entry.mode = "listen";
	tracked.set(atom, entry);

	original.listen(atom, (value) => dispatch(entry, value));

	return atom;
}

export function hookAtoms<T extends Record<string, AnyAtom>>(atoms: T): T {
	for (const [name, atom] of pairs(atoms)) {
		hookAtom(atom as AnyAtom, { label: name as string });
	}
	return atoms;
}
