import Signal from "@rbxts/lemon-signal";
import { UserInputService } from "@rbxts/services";
import { Trove } from "@rbxts/trove";

// migrated from https://github.com/SirMallard/Iris/blob/main/src/libraries/UserInputService/init.lua

export namespace Input {
	const bin = new Trove();

	let inputX = 0;
	let inputY = 0;
	const keysDown = new Set<Enum.KeyCode>();

	export const InputBegan = bin.add(new Signal<[inputObject: InputObject, gameProcessed: boolean]>());
	export const InputChanged = bin.add(new Signal<[inputObject: InputObject, gameProcessed: boolean]>());
	export const InputEnded = bin.add(new Signal<[inputObject: InputObject, gameProcessed: boolean]>());
	export const MouseMoved = bin.add(new Signal<[x: number, y: number]>());
	export const TouchTapInWorld = bin.add(new Signal<[x: number, y: number]>());

	const sinkFrame = bin.add(new Instance("Frame"));
	sinkFrame.Name = "IrisSinkFrame";
	sinkFrame.AnchorPoint = new Vector2(0.5, 0.5);
	sinkFrame.Position = UDim2.fromScale(0.5, 0.5);
	sinkFrame.Size = UDim2.fromScale(1, 1);
	sinkFrame.BackgroundTransparency = 1;
	sinkFrame.ZIndex = 1024 ** 2;

	export function GetMouseLocation(): Vector2 {
		return new Vector2(inputX, inputY);
	}

	export function IsKeyDown(key: Enum.KeyCode): boolean {
		return keysDown.has(key);
	}

	export function destroy() {
		bin.destroy();
	}

	function onInputBegan(inputObject: InputObject) {
		keysDown.add(inputObject.KeyCode);
		InputBegan.Fire(inputObject, false);
	}

	function onInputChanged(inputObject: InputObject) {
		InputChanged.Fire(inputObject, false);
	}

	function onInputEnded(inputObject: InputObject) {
		keysDown.delete(inputObject.KeyCode);
		InputEnded.Fire(inputObject, false);
	}

	function onMouseMoved(x: number, y: number) {
		inputX = x;
		inputY = y;
		MouseMoved.Fire(x, y);
	}

	export function mount(parent: Instance) {
		sinkFrame.Parent = parent;
	}

	sinkFrame.InputBegan.Connect(onInputBegan);
	sinkFrame.InputChanged.Connect(onInputChanged);
	sinkFrame.InputEnded.Connect(onInputEnded);
	sinkFrame.MouseMoved.Connect(onMouseMoved);

	bin.add(UserInputService.InputBegan.Connect(onInputBegan));
	bin.add(UserInputService.InputChanged.Connect(onInputChanged));
	bin.add(UserInputService.InputEnded.Connect(onInputEnded));
}
