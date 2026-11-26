import type { Action, Dependent, SourceLocation } from "@rbxts/charm-devtools";
import { setDependents } from "atoms/dependents";
import { addToHistory } from "atoms/history";

export function seedTestState() {
	const now = DateTime.now().UnixTimestampMillis / 1000;

	const seed = [
		["app/isLoading", "client", true],
		["app/hasPlayerJoined", "server", false],
		["app/player", "server", { id: 41, name: "Player1", alive: true }],
		["app/lastUpdate", "server", now],
		["ui/isMenuOpen", "client", false],
		["ui/activeTab", "client", "home"],
		["ui/notifications", "client", [{ title: "Welcome", read: false }]],
		["game/matchState", "server", { phase: "lobby", players: 4, settings: { map: "Game1", rounds: 3 } }],
		["game/timeRemaining", "server", 120],
		["game/round", "server", 1],
		["app/hasPlayerJoined", "server", true],
		["game/timeRemaining", "server", 90],
		["ui/notifications", "client", [{ title: "Welcome", read: true }]],
		["game/matchState", "server", { phase: "playing", players: 4, settings: { map: "Game2", rounds: 3 } }],
		["app/isLoading", "client", false],
		["app/player", "server", { id: 42, name: "Player2", alive: true }],
		["app/player", "client", { id: 42, name: "Player2", alive: false }],
		["app/lastUpdate", "client", now - 5],
	] as const;

	const shared = "ReplicatedStorage.Shared";
	const sourceOf = (name: string, env: Action["env"]): SourceLocation => {
		const [group] = name.match("^[^/]+");
		const module = `atoms.${group}`;
		if (group === "app") return { script: `${shared}.${module}`, line: 4 };
		return env === "server"
			? { script: `ServerScriptService.Server.${module}`, line: 6 }
			: { script: `Players.Player1.PlayerScripts.Client.${module}`, line: 8 };
	};

	for (const [index, [name, env, value]] of ipairs(seed)) {
		addToHistory({
			id: `preview-${index}`,
			atomId: `${env}:${name}`,
			name,
			timestamp: now - (seed.size() - index) * 2,
			value,
			env,
			source: sourceOf(name, env),
		});
	}

	const seedDependents: [string, Action["env"], Dependent[]][] = [
		[
			"server:app/player",
			"server",
			[
				{ id: "server:app/hasPlayerJoined", kind: "atom", name: "app/hasPlayerJoined", depth: 1 },
				{
					id: "c1",
					kind: "computed",
					name: `${shared}.selectors:14`,
					depth: 1,
					source: { script: `${shared}.selectors`, line: 14 },
				},
				{
					id: "e1",
					kind: "effect",
					name: `${shared}.sync:31`,
					depth: 2,
					source: { script: `${shared}.sync`, line: 31 },
				},
				{ id: "server:app/lastUpdate", kind: "atom", name: "app/lastUpdate", depth: 2 },
			],
		],
		[
			"server:game/matchState",
			"server",
			[
				{ id: "server:game/round", kind: "atom", name: "game/round", depth: 1 },
				{ id: "server:game/timeRemaining", kind: "atom", name: "game/timeRemaining", depth: 1 },
				{ id: "l1", kind: "listener", name: `${shared}.hud:8`, depth: 2, source: { script: `${shared}.hud`, line: 8 } },
			],
		],
	];

	for (const [atomId, env, list] of seedDependents) {
		setDependents({ type: "dependents", atomId, env, timestamp: now, dependents: list });
	}

	task.spawn(() => {
		for (const i of $range(1, 10)) {
			task.wait(1);
			const id = 2;
			const now = DateTime.now().UnixTimestampMillis / 1000;
			const [name, env, value] = seed[id];

			addToHistory({
				id: `preview-live-${i}`,
				atomId: `${env}:${name}`,
				name,
				timestamp: now,
				value: { ...value, id: value.id + i },
				env,
				source: sourceOf(name, env),
			});
		}
	});
}
