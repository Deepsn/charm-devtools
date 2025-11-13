import { createRoot } from "@rbxts/react-roblox";
import { History } from "app/layout/history";
import { Preview } from "app/layout/preview";
import React, { StrictMode } from "react";

export function App() {
	return (
		<>
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} />
			<History />
			<Preview />
		</>
	);
}

export function renderApp(widget: DockWidgetPluginGui) {
	const root = createRoot(widget);

	root.render(
		<StrictMode>
			<App />
		</StrictMode>,
	);

	return () => root.unmount();
}
