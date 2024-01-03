import type * as React from "react";
import { useState, useEffect } from "react";
import LTReact, { type ReactComponentResult } from "../../index";
import BaseIcon, { type Props as IconProps } from "../../components/icon/icon";
import { isDocumentNode } from "../../../common/utils";

interface AdditionalProps {
	root?: HTMLElement;
}

export interface LtIconViewSetTextDirectionEventDetail {
	isRTL: boolean;
}

export const EVENT_SET_TEXT_DIRECTION = "lt-icon-view.set-text-direction";

const IconView: React.FC<IconProps & AdditionalProps> = ({ root, onClick, onMouseOver, onMouseOut, ...props }) => {
	const [isRTL, setIsRTL] = useState<boolean | undefined>();

	useEffect(() => {
		const handleEvent = (event: CustomEvent<LtIconViewSetTextDirectionEventDetail>) => {
			setIsRTL(event.detail.isRTL);
		};

		root?.addEventListener(EVENT_SET_TEXT_DIRECTION, handleEvent);

		return () => {
			root?.removeEventListener(EVENT_SET_TEXT_DIRECTION, handleEvent);
		};
	}, [root, setIsRTL]);

	return <BaseIcon {...props} isRTL={isRTL} onClick={onClick} onMouseOver={onMouseOver} onMouseOut={onMouseOut} />;
};

IconView.displayName = "IconView";

export default async function createIcon(root: Document | HTMLElement, props: IconProps): ReactComponentResult {
	const propsWithOptionalRoot = isDocumentNode(root) ? props : { ...props, root };

	return await LTReact.createView(root, IconView, propsWithOptionalRoot);
}
