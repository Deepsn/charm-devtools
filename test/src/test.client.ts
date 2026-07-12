import { atom } from "@rbxts/charm";
import { hookAtom } from "@rbxts/charm-devtools";

const helloAtom = hookAtom(atom("Hello world"));

task.wait(2);

helloAtom("CLIENT Hello charm devtools");

// while (true) {
// 	task.wait(1);
// 	helloAtom((v) => v + 1);
// }
