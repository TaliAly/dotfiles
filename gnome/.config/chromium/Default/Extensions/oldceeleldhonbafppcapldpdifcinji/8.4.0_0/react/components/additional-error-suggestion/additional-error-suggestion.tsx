import type * as React from "react";
import { useMemo, useEffect } from "react";
import { Div, Span, useI18nContext, useRootContext } from "../../index";
import { classes } from "../../../common/utils";
import CardContent from "../card-content/card-content";
import Icon from "../icon/icon";
import { useBaseCardContext } from "../card-base/hooks";
import { isObject } from "../../../core/utils";
import type { RephraseObject } from "../../../core/Checker";

export interface Caption {
	loading: string;
	missing: string;
	apply: string;
}

type Props = React.PropsWithChildren<{
	suggestion: RephraseObject | null;
	caption: Caption;
	isLoading: boolean;
	isIdle: boolean;
	error: Error | null;
	showRuleId: boolean;
	onClick: (e: Event) => void;
	onSuggestionMouseOver?: (e: Event) => void;
	onSuggestionMouseOut?: (e: Event) => void;
}>;

const AdditionalErrorSuggestion: React.FC<Props> = ({
	suggestion,
	caption,
	isLoading,
	isIdle,
	error,
	showRuleId,
	children,
	onClick,
	onSuggestionMouseOver,
	onSuggestionMouseOut,
}) => {
	const { isInDOM } = useRootContext();
	const { updateCardPosition, moveCardIntoViewport } = useBaseCardContext();
	const isMissing = !isLoading && (!!error || !suggestion);
	const Caption = useMemo<React.FC>(
		() =>
			function Caption() {
				const getMessage = useI18nContext();
				const buttonLabel = useMemo(() => getMessage("additionalErrorSuggestionApplyButtonLabel"), []);
				const shouldShowApply = !error && !!suggestion;
				const captionText = (() => {
					switch (true) {
						case isMissing:
							return caption.missing;
						case isLoading:
							return caption.loading;
						case shouldShowApply:
							return caption.apply;
						default:
							throw new Error("Invalid state of Additional Error Suggestion");
					}
				})();

				return (
					<Div className="lt-comp-additional-error-suggestion__header">
						<Span
							className={classes(
								"lt-comp-additional-error-suggestion__caption",
								isLoading && "lt-comp-additional-error-suggestion__caption--loading",
								isMissing && "lt-comp-additional-error-suggestion__caption--missing"
							)}
						>
							{captionText}
						</Span>
						{shouldShowApply && (
							<Span
								className="lt-comp-additional-error-suggestion__apply"
								data-lt-tabindex="0"
								onClick={onClick}
								onMouseOver={onSuggestionMouseOver}
								onMouseOut={onSuggestionMouseOut}
							>
								{buttonLabel} <Icon name="insert" compact />
							</Span>
						)}
					</Div>
				);
			},
		[error, caption, suggestion, isLoading, isMissing, onClick, onSuggestionMouseOver, onSuggestionMouseOut]
	);

	const Wrap = useMemo<React.FC<React.PropsWithChildren>>(
		() =>
			function Wrap({ children }) {
				return (
					<CardContent
						caption={<Caption />}
						className={classes(
							"lt-comp-additional-error-suggestion",
							isMissing && "lt-comp-additional-error-suggestion--missing"
						)}
						isLoading={isLoading}
						noPadding={true}
						isIdle={isIdle}
					>
						{children}
					</CardContent>
				);
			},
		[Caption, isMissing, isLoading, isIdle]
	);

	useEffect(() => {
		if (isInDOM && isObject(suggestion)) {
			updateCardPosition();
		}
	}, [isInDOM, suggestion, updateCardPosition]);

	useEffect(moveCardIntoViewport, [suggestion, moveCardIntoViewport]);

	if (isLoading || error || !suggestion) {
		return <Wrap />;
	}

	return (
		<Wrap>
			<Div
				className="lt-comp-additional-error-suggestion__suggestion"
				data-lt-testid="additional-error-suggestion"
				onClick={onClick}
				onMouseOver={onSuggestionMouseOver}
				onMouseOut={onSuggestionMouseOut}
			>
				{showRuleId && (
					<Span className="lt-comp-additional-error-suggestion__suggestion__origin">{suggestion.label}</Span>
				)}
				<Div className="lt-comp-additional-error-suggestion__suggestion__content">{children}</Div>
			</Div>
		</Wrap>
	);
};

export default AdditionalErrorSuggestion;
