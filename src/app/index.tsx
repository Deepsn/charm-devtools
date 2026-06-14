import { effect } from "@rbxts/charm";
import Iris, { type Widget } from "@rbxts/iris";
import { enabled } from "atoms";
import { Input } from "lib/user-input-service";

export function renderApp(container: DockWidgetPluginGui) {
	Input.mount(container);

	Iris.Internal._utility.UserInputService = Input as unknown as UserInputService;
	Iris.UpdateGlobalConfig({
		UseScreenGUIs: false,
	});
	Iris.Disabled = true;

	Iris.Init(container);

	const disconnect = Iris.Connect(() => {
		const window = Iris.ShowDemoWindow() as unknown as Widget<{ State: { size: Vector2; position: Vector2 } }>;
		window.state.size.set(container.AbsoluteSize);
		window.state.position.set(Vector2.zero);
	});

	effect(() => {
		Iris.Disabled = !enabled();
	});

	print("App rendered");

	return () => {
		print("Unmounting app");
		Input.destroy();
		disconnect();
		Iris.Shutdown();
	};
}
