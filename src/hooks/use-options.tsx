import { useAtom } from "@rbxts/react-charm";
import { options, type StateOf } from "atoms";

export function useOptions(optionName: keyof StateOf<typeof options>) {
	const optionsValues = useAtom(options);

	return optionsValues[optionName];
}
