import { install } from "@rbxts/charm-devtools";

install();

import { atom } from "@rbxts/charm";

const helloAtom = atom("Hello world");

const unlabeledAtom = atom(0);

const atoms = {
	hello: atom("Hello from client"),
	complex: atom({ foo: "bar", baz: 42, nested: { a: 1, b: 2, deep: { c: 3, more: { d: 4 } } } }),
	anotherAtom: atom(0),
};

task.wait(2);

atoms.anotherAtom(423);
helloAtom("CLIENT Hello charm devtools");

while (true) {
	task.wait(1);
	helloAtom((v) => v + 1);
	unlabeledAtom((v) => v + 1);
}
