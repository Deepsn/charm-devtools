/// <reference types="@rbxts/types/plugin" />

import { effect } from "@rbxts/charm";
import { renderApp } from "app";
import { enabled } from "atoms";
import { createBridge } from "bridge";
import { IS_RUNNING } from "constants/core";

function main() {
	const toolbar = plugin.CreateToolbar("Charm DevTools");
	const button = toolbar.CreateButton("Open devtools", "", "");

	const widget = plugin.CreateDockWidgetPluginGuiAsync(
		"charm-devtools",
		new DockWidgetPluginGuiInfo(Enum.InitialDockState.Float, false, false, 600, 400),
	);
	widget.Name = "Charm DevTools";
	widget.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;

	button.Click.Connect(() => enabled((prev) => !prev));

	effect(() => {
		const isEnabled = enabled();
		widget.Enabled = isEnabled;
		button.SetActive(isEnabled);
	});

	const cleanupBridge = createBridge();
	const unmountApp = renderApp(widget);

	plugin.Unloading.Connect(() => {
		unmountApp();
		cleanupBridge();
	});
}

if (!IS_RUNNING) {
	main();
}
