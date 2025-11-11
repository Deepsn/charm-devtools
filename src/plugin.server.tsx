/// <reference types="@rbxts/types/plugin" />

import { atom, effect } from "@rbxts/charm";
import { createRoot } from "@rbxts/react-roblox";
import { App } from "app";
import React, { StrictMode } from "react";

const enabled = atom(true);

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

const root = createRoot(widget);

root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
