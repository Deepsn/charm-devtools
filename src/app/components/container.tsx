import React, { type ForwardedRef, forwardRef, type PropsWithChildren } from "react";

interface ContainerProps extends Partial<WritableProperties<Frame>> {
	scrollable?: boolean;
}

export const Container = forwardRef(
	(props: PropsWithChildren & ContainerProps, ref: ForwardedRef<ScrollingFrame | Frame>) => {
		const rest = { ...props, children: undefined, scrollable: undefined };

		if (props.scrollable) {
			return (
				<scrollingframe
					{...rest}
					Size={rest.Size ?? UDim2.fromScale(1, 1)}
					CanvasSize={new UDim2()}
					AutomaticCanvasSize={Enum.AutomaticSize.Y}
					Transparency={1}
					ScrollBarThickness={6}
					ref={ref as ForwardedRef<ScrollingFrame>}
				>
					{props.children}
				</scrollingframe>
			);
		}

		return (
			<frame {...rest} Size={rest.Size ?? UDim2.fromScale(1, 1)} Transparency={1} ref={ref as ForwardedRef<Frame>}>
				{props.children}
			</frame>
		);
	},
);
