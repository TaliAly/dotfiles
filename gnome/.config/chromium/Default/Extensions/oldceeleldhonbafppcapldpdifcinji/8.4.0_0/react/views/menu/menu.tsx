import type * as React from "react";
import LTReact, { type ReactComponentResult } from "../../index";
import Menu, { type Props } from "../../components/menu/menu";

const MenuView: React.FC<Props> = (props) => {
	return <Menu {...props} />;
};

MenuView.displayName = "MenuView";

export default async function createMenu(doc: Document, props: Props): ReactComponentResult {
	return await LTReact.createView(doc, MenuView, props);
}
