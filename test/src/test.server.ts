import "@rbxts/charm-devtools/out/install";

import { atom } from "@rbxts/charm";

const helloAtom = atom("Hello world");

task.wait(2);

helloAtom("SERVER Hello charm devtools");
