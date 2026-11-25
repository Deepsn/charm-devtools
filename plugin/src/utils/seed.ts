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
	] as const;

	for (const [index, [name, env, value]] of ipairs(seed)) {
		addToHistory({
			id: `preview-${index}`,
			atomId: `${env}:${name}`,
			name,
			timestamp: now - (seed.size() - index) * 2,
			value,
			env,
		});
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
			});
		}
	});
}
