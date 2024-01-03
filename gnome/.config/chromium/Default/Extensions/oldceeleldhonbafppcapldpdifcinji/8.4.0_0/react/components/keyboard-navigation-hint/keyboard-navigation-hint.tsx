import type * as React from "react";
import { useRef } from "react";
import { elementFactory, useI18nContext } from "../../index";

interface Props {
	className?: string;
}

const LTCompKeyboardNavigationHint = elementFactory("comp-keyboard-navigation-hint");

const KeyboardNavigationHint: React.FC<Props> = ({ className }) => {
	const getMessage = useI18nContext();
	const { current: i18n } = useRef<Record<"errorCardKeyboardInstructions", string>>({
		errorCardKeyboardInstructions: getMessage("errorCardKeyboardInstructions", [
			"<lt-em>Enter</lt-em>",
			"<lt-em>&#8679;</lt-em> <lt-em>Enter</lt-em>",
		]),
	});
	return (
		<LTCompKeyboardNavigationHint
			className={className}
			dangerouslySetInnerHTML={{ __html: i18n.errorCardKeyboardInstructions }}
		/>
	);
};

export default KeyboardNavigationHint;
