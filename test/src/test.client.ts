import { atom } from "@rbxts/charm";
import { hookAtom, hookAtoms } from "@rbxts/charm-devtools";

const helloAtom = hookAtom(atom("Hello world"));

const atoms = hookAtoms({
	hello: atom("Hello from client"),
	complex: atom({ foo: "bar", baz: 42, nested: { a: 1, b: 2, deep: { c: 3, more: { d: 4 } } } }),
	anotherAtom: atom(0),
});

task.wait(2);

atoms.anotherAtom(423);
helloAtom("CLIENT Hello charm devtools");

// while (true) {
// 	task.wait(1);
// 	helloAtom((v) => v + 1);
// }
