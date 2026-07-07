/// <reference types="@rbxts/types/plugin" />+

import { effect, onCleanup, trigger } from "@rbxts/charm";
import Iris from "@rbxts/iris";
import { renderApp } from "app";
import { enabled } from "atoms";
import { createBridge } from "bridge";
import { Input } from "lib/user-input-service";

function createApp(widget: DockWidgetPluginGui) {
	const unmountApp = renderApp(widget);

	return () => {
		unmountApp();
	};
}

function main() {
	const toolbar = plugin.CreateToolbar("Charm DevTools");
	const button = toolbar.CreateButton("Open devtools", "", "");

	const widget = plugin.CreateDockWidgetPluginGuiAsync(
		"charm-devtools",
		new DockWidgetPluginGuiInfo(Enum.InitialDockState.Float, false, false, 600, 400),
	);
	widget.Name = "Charm DevTools";
	widget.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;

	const cleanupBridge = createBridge();

	Iris.Init(widget);
	Input.mount(widget);

	button.Click.Connect(() => enabled((prev) => !prev));
	(widget as unknown as { BindToClose(callback: () => void): void }).BindToClose(() => enabled(false));

	let cleanup: (() => void) | undefined;

	const disposeEffect = effect(() => {
		const isEnabled = enabled();

		widget.Enabled = isEnabled;
		button.SetActive(isEnabled);

		if (!isEnabled) return;

		cleanup = createApp(widget);
		onCleanup(cleanup);
	});

	plugin.Unloading.Connect(() => {
		enabled(false);
		trigger(enabled);

		Input.destroy();

		cleanupBridge();
		disposeEffect();

		widget.Destroy();
		Iris.Shutdown();
	});
}

const isDev = game.PlaceId === 0;
if (isDev) {
	main();
}
