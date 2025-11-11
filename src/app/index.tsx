import { History } from "app/layout/history";
import { Preview } from "app/layout/preview";
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
