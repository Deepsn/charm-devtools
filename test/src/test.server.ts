import { atom } from "@rbxts/charm";
import { hookAtom } from "shared/hook-atom";

const helloAtom = hookAtom(atom("Hello world"));

task.wait(2);

helloAtom("SERVER Hello charm devtools");
