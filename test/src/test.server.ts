import { atom } from "@rbxts/charm";
import { hookAtom } from "@rbxts/charm-devtools";

const helloAtom = hookAtom(atom("Hello world"));

task.wait(2);

helloAtom("SERVER Hello charm devtools");
