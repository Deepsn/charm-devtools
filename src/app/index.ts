import { atom, effect } from "@rbxts/charm";
import Iris from "@rbxts/iris";
import { Trove } from "@rbxts/trove";
import { enabled } from "atoms/plugin";
import { WINDOWS } from "constants/windows";
import { Input } from "lib/user-input-service";

export function renderApp(container: DockWidgetPluginGui) {
	const bin = new Trove();

	const currentWindow = atom<keyof typeof WINDOWS>("history");

	Iris.Internal._utility.UserInputService = Input as unknown as UserInputService;
	Iris.UpdateGlobalConfig({
		UseScreenGUIs: false,
	});
	Iris.Disabled = true;

	const windowSettings = {
		NoTitleBar: true,
		NoBackground: false,
		NoCollapse: true,
		NoClose: true,
		NoMove: true,
		NoScrollbar: false,
		NoResize: true,
		NoNav: false,
		NoMenu: false,
	};

	bin.add(
		Iris.Connect(() => {
			const window = Iris.Window([
				"Charm devtools",
				windowSettings.NoTitleBar,
				windowSettings.NoBackground,
				windowSettings.NoCollapse,
				windowSettings.NoClose,
				windowSettings.NoMove,
				windowSettings.NoScrollbar,
				windowSettings.NoResize,
				windowSettings.NoNav,
				windowSettings.NoMenu,
			]);
			window.state.size.set(container.AbsoluteSize);
			window.state.position.set(Vector2.zero);

			const render = WINDOWS[currentWindow()];

			if (render) {
				render();
			} else {
				Iris.Text([`No render function found for window: ${currentWindow()}`]);
			}

			Iris.End();
		}),
	);

	bin.add(
		effect(() => {
			Iris.Disabled = !enabled();
		}),
	);

	print("App rendered");

	return () => {
		print("Unmounting app");
		bin.destroy();
	};
}
