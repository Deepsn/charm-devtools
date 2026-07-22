import type { InstanceAttributes, PropsWithChildren } from "@rbxts/vide";
import Vide from "@rbxts/vide";

export function Container(props: PropsWithChildren & InstanceAttributes<Frame>) {
	const frameProps = { ...props, children: undefined };

	return (
		<frame BackgroundTransparency={1} {...frameProps}>
			{props.children}
		</frame>
	);
}
