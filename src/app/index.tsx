import Iris from "@rbxts/iris";
import { History } from "app/layout/history";
import { Preview } from "app/layout/preview";
import { Input } from "lib/user-input-service";
import React from "react";

export function App() {
	return (
		<>
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} />
			<History />
			<Preview />
		</>
	);
}

export function renderApp(container: DockWidgetPluginGui) {
	Input.mount(container);

	Iris.Internal._utility.UserInputService = Input as unknown as UserInputService;
	Iris.UpdateGlobalConfig({
		UseScreenGUIs: false,
	});
	Iris.Disabled = true;

	Iris.Init(container);

	const disconnect = Iris.Connect(() => {
		Iris.ShowDemoWindow();
	});

	return () => {
		disconnect();
		Iris.Shutdown();
	};
}
