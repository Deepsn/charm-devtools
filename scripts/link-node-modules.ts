import { lstatSync, readFileSync, symlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rootModules = join(root, "node_modules");

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
	workspaces?: string[] | { packages?: string[] };
};
const workspaces = Array.isArray(pkg.workspaces) ? pkg.workspaces : (pkg.workspaces?.packages ?? []);

for (const ws of workspaces) {
	const link = join(root, ws, "node_modules");

	let exists = false;
	try {
		lstatSync(link);
		exists = true;
	} catch {}

	if (exists) continue;

	try {
		symlinkSync(rootModules, link, "junction");
		console.log(`linked ${ws}/node_modules -> ../node_modules`);
	} catch (err) {
		console.warn(`could not link ${ws}/node_modules: ${err}`);
	}
}
