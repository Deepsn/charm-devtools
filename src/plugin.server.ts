/// <reference types="@rbxts/types/plugin" />

import { effect } from "@rbxts/charm";
import { renderApp } from "app";
import { enabled } from "atoms";
import { createBridge } from "bridge";

const toolbar = plugin.CreateToolbar("Charm DevTools");
const button = toolbar.CreateButton("Open", "", "");

const widget = plugin.CreateDockWidgetPluginGui(
	"charm-devtools",
	new DockWidgetPluginGuiInfo(Enum.InitialDockState.Float, false, false, 600, 400),
);
widget.Name = "Charm DevTools";

button.Click.Connect(() => enabled((prev) => !prev));

effect(() => {
	widget.Enabled = enabled();
});

const cleanupBridge = createBridge();
const unmountApp = renderApp(widget);

plugin.Unloading.Connect(() => {
	unmountApp();
	cleanupBridge();
});
