import { IS_STUDIO } from "constants";
import { hookAtomCreation } from "hook-atom";

export { createBridge } from "bridge";
export {
	type AtomInfo,
	type AtomWriteContext,
	type AtomWriteMiddleware,
	addCharmHooks,
	type CharmHooks,
	type DependentInfo,
	getAtomDependents,
	getAtomInfo,
	getHookedAtoms,
	installCharmHooks,
	isCharmHooked,
	type NodeInfo,
	original,
	setAtomLabel,
	uninstallCharmHooks,
	withoutDependencyTracking,
} from "charm-hooks";
export { hookAtom, hookAtomCreation, hookAtoms } from "hook-atom";
export type { Action, Dependent, DependentKind, DependentsUpdate, SourceLocation } from "protocol";

export function install() {
	if (!IS_STUDIO) return;
	hookAtomCreation();
}
