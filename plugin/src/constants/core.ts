import { Players, RunService } from "@rbxts/services";

export const IS_RUNNING = RunService.IsRunning();
export const IS_A_DEV = Players.LocalPlayer?.UserId === 78662128;
export const IS_DEV = (plugin: Plugin) => game.PlaceId === 0 && plugin.Name.match("user_")[0] !== undefined;
