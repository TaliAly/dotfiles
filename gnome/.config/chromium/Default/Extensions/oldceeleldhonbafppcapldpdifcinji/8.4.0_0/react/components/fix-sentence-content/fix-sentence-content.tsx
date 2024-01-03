import type * as React from "react";
import { useRef, useMemo } from "react";
import type { TextError } from "../../../core/Checker";
import AdditionalErrorSuggestion, {
	type Caption as SuggestionCaption,
} from "../additional-error-suggestion/additional-error-suggestion";
import { Div, useI18nContext } from "../../index";
import useStopPropagation from "../../hooks/use-stop-propagation";

export interface FixSentencePayload {
	start: number;
	end: number;
	content: string;
	includedErrors: TextError[];
	selectedErrorId: string;
}

interface Props {
	sentence: FixSentencePayload;
	isIdle: boolean;
	showRuleId: boolean;
	onSuggestionClick: (sentence: FixSentencePayload, replacement: string, shouldSelectNextError: boolean) => void;
	onSuggestionMouseOver: (includedErrorIds: string[]) => void;
	onSuggestionMouseOut: () => void;
}

interface ErrorContext {
	prefix: string;
	suffix: string;
}

const getContextForErrors = (sentence: FixSentencePayload): ErrorContext[] => {
	const result: ErrorContext[] = [];
	const max = sentence.includedErrors.length - 1;

	for (let i = 0; i <= max; i++) {
		const currentError = sentence.includedErrors[i];
		const nextError = i < max ? sentence.includedErrors[i + 1] : undefined;
		const context = { prefix: "", suffix: "" };

		if (i === 0) {
			context.prefix = sentence.content.slice(0, currentError.start);
		}

		if (nextError) {
			context.suffix = sentence.content.slice(currentError.end, nextError.start);
		} else {
			context.suffix = sentence.content.slice(currentError.end);
		}

		result.push(context);
	}

	return result;
};

const getSuggestion = (sentence: FixSentencePayload) => {
	const errorContexts = getContextForErrors(sentence);
	let i = sentence.includedErrors.length - 1;
	let suggestion = "";

	for (; i >= 0; i--) {
		const context = errorContexts[i] || { prefix: "", suffix: "" };
		const replacement = sentence.includedErrors[i].fixes[0].value;

		suggestion = context.prefix + replacement + context.suffix + suggestion;
	}

	return suggestion;
};

const FixSentenceContent: React.FC<Props> = ({
	sentence,
	isIdle,
	showRuleId,
	onSuggestionClick,
	onSuggestionMouseOver,
	onSuggestionMouseOut,
}) => {
	const getMessage = useI18nContext();
	const { current: caption } = useRef<SuggestionCaption>({
		apply: getMessage("fixSentenceCardHeadlineApply"),
		loading: getMessage("fixSentenceCardHeadlineLoading"),
		missing: getMessage("fixSentenceCardHeadlineMissing"),
	});
	const suggestion = useMemo(() => getSuggestion(sentence), [sentence]);
	const handleSuggestionClick = useStopPropagation((e) => {
		if (suggestion) {
			onSuggestionClick(sentence, suggestion, !e.isTrusted && (e as KeyboardEvent).shiftKey);
		}
	});
	const handleSuggestionMouseOver = useStopPropagation(() =>
		onSuggestionMouseOver(sentence.includedErrors.map(({ id }) => String(id)))
	);
	const handleSuggestionMouseOut = useStopPropagation(() => onSuggestionMouseOut());

	return (
		<AdditionalErrorSuggestion
			caption={caption}
			error={null}
			isIdle={isIdle}
			isLoading={false}
			showRuleId={showRuleId}
			suggestion={{
				text: sentence.content,
				label: "fix-sentence",
				uuid: "<irrelevant>",
				origin: "<none>",
				score: { a: 1 },
			}}
			onClick={handleSuggestionClick}
			onSuggestionMouseOver={handleSuggestionMouseOver}
			onSuggestionMouseOut={handleSuggestionMouseOut}
		>
			<Div className="lt-comp-fix-sentence-suggestion">{suggestion}</Div>
		</AdditionalErrorSuggestion>
	);
};

export default FixSentenceContent;
