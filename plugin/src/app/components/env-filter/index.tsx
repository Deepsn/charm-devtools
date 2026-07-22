import Vide from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { EnvSwitch } from "app/components/env-filter/env-switch";
import { envFilter, toggleEnvFilter } from "atoms/inspector";

export function EnvFilter() {
	const state = useAtom(envFilter);

	return <EnvSwitch enabled={(env) => state()[env]} onToggle={toggleEnvFilter} />;
}
