import type * as React from "react";
import { useRef } from "react";
import { useI18nContext } from "../../index";
import DiffComponent from "../diff/diff";
import { useLoadSplitSentence } from "./hooks";
import { UserForRephraseInterface } from "../../../core/Rephrasings";
import { RephraseObject } from "../../../core/Checker";
import useStopPropagation from "../../hooks/use-stop-propagation";
import AdditionalErrorSuggestion, {
	type Caption as SuggestionCaption,
} from "../additional-error-suggestion/additional-error-suggestion";

export interface Props {
	inhouseOnly: boolean;
	uniqueId: string;
	showRuleId: boolean;
	sentence: string;
	language: string;
	isIdle: boolean;
	user: UserForRephraseInterface | undefined;
	onSuggestionClick: (phrase: RephraseObject, shouldSelectNextError: boolean) => void;
}

const SentenceSplittingContent: React.FC<Props> = ({
	inhouseOnly,
	language,
	sentence,
	uniqueId,
	isIdle,
	user,
	showRuleId,
	onSuggestionClick,
}) => {
	const getMessage = useI18nContext();
	const { current: caption } = useRef<SuggestionCaption>({
		apply: getMessage("sentenceSplittingCardHeadlineApply"),
		loading: getMessage("sentenceSplittingCardHeadlineLoading"),
		missing: getMessage("sentenceSplittingCardHeadlineMissing"),
	});
	const [splitSentence, isLoading, error] = useLoadSplitSentence({
		inhouseOnly,
		language,
		sentence,
		uniqueId,
		user,
	});
	const handleSuggestionClick = useStopPropagation((e) => {
		if (splitSentence) {
			onSuggestionClick(splitSentence, !e.isTrusted && (e as KeyboardEvent).shiftKey);
		}
	});

	return (
		<AdditionalErrorSuggestion
			suggestion={splitSentence}
			caption={caption}
			error={error}
			isIdle={isIdle}
			isLoading={isLoading}
			showRuleId={showRuleId}
			onClick={handleSuggestionClick}
		>
			{splitSentence?.text && <DiffComponent from={sentence} to={splitSentence?.text} isSentenceSplitting />}
		</AdditionalErrorSuggestion>
	);
};

export default SentenceSplittingContent;
