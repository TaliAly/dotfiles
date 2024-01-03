import type * as React from "react";
import { classes } from "../../../common/utils";
import { Div, Span, elementFactory } from "../../index";

type MenuItemName = "pause" | "disable" | "disable_circle";

interface MenuItem {
	label: string;
	name: MenuItemName;
	isClickable: boolean;
	onClick: (event: Event) => void;
}

export interface Props {
	isActive: boolean;
	position: "top" | "bottom";
	menuItems: MenuItem[];
}

const LTCompMenu = elementFactory("comp-menu");

// TODO: implement menu overlay
const Menu: React.FC<Props> = (props) => {
	const { isActive, position, menuItems } = props;

	const handleMenuItemClick = (event: Event, item: MenuItem) => {
		item.isClickable && item.onClick(event);
	};

	return (
		<LTCompMenu
			className={classes(
				isActive && "lt-menu--show",
				position === "top" && "lt-menu--position-top",
				position === "bottom" && "lt-menu--position-bottom"
			)}
			data-lt-prevent-focus
		>
			{menuItems.map((item) => (
				<Div
					key={item.label}
					className={classes(
						"lt-menu__item",
						item.name === "pause" && "lt-menu__item--pause",
						item.name === "pause" && "lt-icon__pause",
						item.name === "disable" && "lt-menu__item--disable",
						item.name === "disable" && "lt-icon__disable",
						item.name === "disable_circle" && "lt-menu__item--disable_circle",
						item.name === "disable_circle" && "lt-icon__disable_circle",
						item.isClickable && "lt-menu__item--clickable"
					)}
					onClick={(e) => handleMenuItemClick(e, item)}
					onMouseDown={(e) => e.preventDefault()}
				>
					<Span
						className={classes(
							"lt-menu__item__label",
							item.name === "pause" && "lt-menu__item__label--pause",
							item.name === "disable" && "lt-menu__item__label--disable",
							item.name === "disable_circle" && "lt-menu__item__label--disable_circle"
						)}
					>
						{item.label}
					</Span>
				</Div>
			))}
		</LTCompMenu>
	);
};

export default Menu;
