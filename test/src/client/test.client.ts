import { atom } from "@rbxts/charm";
import { hookAtom } from "shared/hook-atom";

const helloAtom = hookAtom(atom(0));

while (true) {
	task.wait(1);
	helloAtom((v) => v + 1);
}
