import Vide, { type Derivable, read } from "@rbxts/vide";

// square icon sized as a fraction of the parent's height
export function Icon(props: {
	image: Derivable<string>;
	name?: string;
	color?: Derivable<Color3>;
	scale?: number;
	AnchorPoint?: Vector2;
	Position?: UDim2;
	Size?: Derivable<number>;
	LayoutOrder?: number;
}) {
	return (
		<imagelabel
			Name={props.name ?? "Icon"}
			AnchorPoint={props.AnchorPoint ?? Vector2.zero}
			Position={props.Position ?? UDim2.fromScale(0, 0)}
			Size={() =>
				props.Size ? UDim2.fromOffset(read(props.Size), read(props.Size)) : UDim2.fromScale(1, props.scale ?? 1)
			}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			Image={props.image}
			ImageColor3={props.color}
			ScaleType={Enum.ScaleType.Fit}
			LayoutOrder={props.LayoutOrder ?? 0}
		>
			<uiaspectratioconstraint AspectRatio={1} DominantAxis={Enum.DominantAxis.Height} />
		</imagelabel>
	);
}
