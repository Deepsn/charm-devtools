/// <reference types="@rbxts/types/plugin" />+

import { effectScope, listen, onCleanup, trigger } from "@rbxts/charm";
import Iris from "@rbxts/iris";
import { renderApp } from "app";
import { enabled } from "atoms/plugin";
import { createBridge } from "bridge";
import { Input } from "lib/user-input-service";

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

	const disposeEffect = listen(enabled, (isEnabled) => {
		widget.Enabled = isEnabled;
		button.SetActive(isEnabled);

		if (!isEnabled) return;

		cleanup = effectScope(() => renderApp(widget));
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
