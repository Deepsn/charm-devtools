/// <reference types="@rbxts/types/plugin" />

import { listen, trigger } from "@rbxts/charm";
import { createBridge } from "@rbxts/charm-devtools";
import { mount } from "@rbxts/vide";
import { App } from "app";
import { addToHistory } from "atoms/history";
import { enabled } from "atoms/plugin";
import { IS_A_DEV, IS_RUNNING } from "constants/core";

const toolbar = plugin.CreateToolbar("Charm DevTools");
const button = toolbar.CreateButton("Open devtools", "", "");

const widget = plugin.CreateDockWidgetPluginGuiAsync(
	"charm-devtools",
	new DockWidgetPluginGuiInfo(Enum.InitialDockState.Float, false, false, 600, 400),
);
widget.Name = "Charm DevTools";
widget.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;

const bridge = IS_RUNNING ? createBridge(addToHistory) : undefined;

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

if (IS_A_DEV && IS_RUNNING) {
	enabled(true);
}

plugin.Unloading.Connect(() => {
	enabled(false);
	trigger(enabled);

	bridge?.dispose();
	disposeEnabled();

	unmount?.();
	widget.Destroy();
});

if (IS_A_DEV) {
	print("charm-devtools running");
}
