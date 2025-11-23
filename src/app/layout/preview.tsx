import Object from "@rbxts/object-utils";
import { useAtom } from "@rbxts/react-charm";
import { Button } from "app/components/button";
import { Container } from "app/components/container";
import { Text } from "app/components/text";
import { selectedAction } from "atoms";
import { palette } from "constants/palette";
import React, { useState } from "react";

function ActionDisplay({ action }: { action: unknown }) {
	const [open, setOpen] = useState(false);

	switch (typeOf(action)) {
		case "table": {
			const isEmpty = Object.keys(action as object).size() === 0;

			if (isEmpty) {
				return <Text Text="{}" Size={new UDim2(1, 0, 0, 30)} TextXAlignment={Enum.TextXAlignment.Left} />;
			}

			return (
				<Container Size={UDim2.fromScale(1, 0)} AutomaticSize={Enum.AutomaticSize.Y}>
					<uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} />

					<Container LayoutOrder={1} Size={new UDim2(1, 0, 0, 30)}>
						<Button
							Size={new UDim2(0, 40, 1, 0)}
							SizeConstraint={Enum.SizeConstraint.RelativeYY}
							onClick={() => setOpen(!open)}
						/>
						<Text Text={open ? "▼ {" : "▶ { ... }"} TextXAlignment={Enum.TextXAlignment.Left} />
					</Container>

					{open && (
						<>
							<Container LayoutOrder={2} Size={UDim2.fromScale(1, 0)} AutomaticSize={Enum.AutomaticSize.Y}>
								<uipadding PaddingLeft={new UDim(0, 30)} />
								<uilistlayout />

								{Object.entries(action as object).map(([key, value]) => {
									return (
										<Container Size={new UDim2(1, 0, 0, 30)} AutomaticSize={Enum.AutomaticSize.Y}>
											<uipadding PaddingLeft={new UDim(0, 10)} PaddingRight={new UDim(0, 10)} />
											<uilistlayout FillDirection={Enum.FillDirection.Horizontal} />

											<Text
												Size={UDim2.fromOffset(0, 30)}
												TextXAlignment={Enum.TextXAlignment.Left}
												AutomaticSize={Enum.AutomaticSize.X}
												Text={`${tostring(key)}: `}
											/>

											<Container Size={UDim2.fromScale(0.9, 0)} AutomaticSize={Enum.AutomaticSize.Y}>
												<ActionDisplay action={value} />
											</Container>
										</Container>
									);
								})}
							</Container>

							<Text
								LayoutOrder={3}
								Size={new UDim2(1, 0, 0, 30)}
								Text={"\t }"}
								TextXAlignment={Enum.TextXAlignment.Left}
							/>
						</>
					)}
				</Container>
			);
		}
		default:
			return <Text Text={tostring(action)} Size={new UDim2(1, 0, 0, 30)} TextXAlignment={Enum.TextXAlignment.Left} />;
	}
}

export function Preview() {
	const selected = useAtom(selectedAction);

	if (!selected) {
		return (
			<Container Size={UDim2.fromScale(0.6, 1)}>
				<Text Text="No action selected" />
			</Container>
		);
	}

	return (
		<Container Size={UDim2.fromScale(0.6, 1)}>
			<uilistlayout />

			<frame BackgroundColor3={palette.primary} Size={new UDim2(1, 0, 0, 30)}>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} />
			</frame>

			<scrollingframe
				BackgroundTransparency={1}
				AutomaticCanvasSize={Enum.AutomaticSize.Y}
				ScrollBarThickness={6}
				CanvasSize={new UDim2()}
				Size={new UDim2(1, 0, 1, -30)}
			>
				<ActionDisplay action={selected.value} />
			</scrollingframe>
		</Container>
	);
}
