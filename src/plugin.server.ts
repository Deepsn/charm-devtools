/// <reference types="@rbxts/types/plugin" />

import { listen, trigger } from "@rbxts/charm";
import { mount } from "@rbxts/vide";
import { App } from "app";
import { enabled } from "atoms/plugin";
import { createBridge } from "bridge";

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

	let unmount: (() => void) | undefined;

	button.Click.Connect(() => enabled((prev) => !prev));
	(widget as unknown as { BindToClose(callback: () => void): void }).BindToClose(() => enabled(false));

	const disposeEnabled = listen(enabled, (isEnabled) => {
		widget.Enabled = isEnabled;
		button.SetActive(isEnabled);

		if (isEnabled) {
			unmount ??= mount(() => App(), widget);
		} else {
			unmount?.();
			unmount = undefined;
		}
	});

	plugin.Unloading.Connect(() => {
		enabled(false);
		trigger(enabled);

		cleanupBridge();
		disposeEnabled();

		unmount?.();
		widget.Destroy();
	});
}

const isDev = game.PlaceId === 0;
if (isDev) {
	main();
}
