import type * as React from "react";
import { useRef, useState, useMemo, useEffect, useLayoutEffect } from "react";
import CardContent, { CardContentTitle, CardContentToggleMore } from "../card-content/card-content";
import { classes } from "../../../common/utils";
import LTReact, { useI18nContext, Div, Span } from "../../index";
import type { SynonymResult } from "../../../background/synonyms";
import { useLoadSynonyms, useTitle, useUpdateKeyboardNavigation } from "./hooks";
import { MAX_INITIAL_SYNONYMS, showFullSynonymSetInitially } from "./util";
import { useBaseCardContext } from "../card-base/hooks";
import { isString, type WordContextInfo } from "../../../core/utils";
import useStopPropagation from "../../hooks/use-stop-propagation";

export interface Props {
	wordContext: WordContextInfo;
	language: string;
	motherLanguage: string;
	wordIsErroneous?: boolean;
	isIdle: boolean;
	onSynonymClick: (word: string) => void;
}

type AlternativesProps = Pick<Props, "onSynonymClick"> & {
	alternatives: SynonymResult["synonymSets"][number]["synonyms"];
	synonymsSource: { name: string; url: string } | undefined;
	showAll: boolean;
};

type SynonymProps = Pick<Props, "onSynonymClick"> & {
	word: string;
};

const Loader: React.FC = () => {
	return (
		<>
			<Div className="lt-comp-synonyms-content__loading__caption" />
			<Div className="lt-comp-synonyms-content__loading__wrapper">
				<Span className="lt-comp-synonyms-content__loading__button" />
				<Span className="lt-comp-synonyms-content__loading__button" />
				<Span className="lt-comp-synonyms-content__loading__button" />
			</Div>
		</>
	);
};

const Synonym: React.FC<SynonymProps> = ({ word, onSynonymClick }) => {
	const handleSynonymClick = useStopPropagation(() => {
		onSynonymClick(word);
	});

	return (
		<Span
			className="lt-comp-synonyms-content__item__button"
			onClick={handleSynonymClick}
			data-lt-tabindex="0"
			data-lt-testid="synonym"
		>
			{word}
		</Span>
	);
};

const Alternatives: React.FC<AlternativesProps> = ({ alternatives, synonymsSource, showAll, onSynonymClick }) => {
	const { updateCardPosition, moveCardIntoViewport } = useBaseCardContext();
	const handleSourceClick = useStopPropagation(() => {
		if (synonymsSource) {
			self.open(synonymsSource.url, "_blank");
		}
	});

	useLayoutEffect(updateCardPosition, [synonymsSource, showAll, updateCardPosition]);

	useEffect(moveCardIntoViewport, [synonymsSource, showAll, moveCardIntoViewport]);

	return (
		<>
			{alternatives.slice(0, showAll ? alternatives.length : MAX_INITIAL_SYNONYMS).map(({ word }, i) => (
				<Synonym key={`${word}-${i}`} word={word} onSynonymClick={onSynonymClick} />
			))}
			{synonymsSource && (
				<Div className="lt-comp-synonyms-content__item__source">
					Source:{" "}
					<Span className="lt-comp-synonyms-content__item__source__link" onClick={handleSourceClick}>
						{synonymsSource.name}
					</Span>
				</Div>
			)}
		</>
	);
};

const EmptyState: React.FC<{ notSupported: boolean; noResults: boolean }> = ({ notSupported, noResults }) => {
	const Wrap = useMemo(
		() =>
			function Wrap({ children }: React.PropsWithChildren) {
				return <Div className="lt-comp-synonyms-content__no-result">{children}</Div>;
			},
		[]
	);

	switch (true) {
		case notSupported:
			return (
				<Wrap>
					<LTReact.Tr name="synonymsCardLanguageNotSupported" />
				</Wrap>
			);
		case noResults:
			return (
				<Wrap>
					<LTReact.Tr name="synonymsCardNoSynonymsAvailable" />
				</Wrap>
			);
		default:
			return null;
	}
};

const SynonymsContent: React.FC<Props> = ({
	wordContext,
	language,
	motherLanguage,
	wordIsErroneous,
	isIdle,
	onSynonymClick,
}) => {
	const { updateCardPosition, moveCardIntoViewport } = useBaseCardContext();
	// Initialize with `null` to be able to detect the "Show less"-click...
	const [showAll, setShowAll] = useState<boolean | null>(null);
	const getMessage = useI18nContext();
	const { current: i18n } = useRef<Record<"synonymsCardHeadline", string>>({
		synonymsCardHeadline: getMessage("synonymsCardHeadline"),
	});
	// TODO: handle error...
	const [synonyms, isLoading, error] = useLoadSynonyms(wordContext, language, motherLanguage);
	const synonymsSource = useMemo(() => {
		if (isString(language) && !language.startsWith("de") && synonyms) {
			return { name: synonyms.dataSource.sourceName, url: synonyms.dataSource.sourceUrl };
		}
	}, [language, synonyms]);
	const titleText = useTitle(wordContext.word, synonyms);
	const title = <CardContentTitle prefix={i18n.synonymsCardHeadline}>{titleText}</CardContentTitle>;
	const hasNoResults = isLoading === false && synonyms?.synonymSets.length === 0;
	const languageNotSupported = error?.name === "NotSupportedError";
	const shouldDisplayToggleMore = useMemo(() => synonyms && synonyms.synonymSets.length > 1, [synonyms]);
	const toggleMoreTestId = showAll ? "collapse-synonyms-list" : "show-all-synonyms";
	const onShowMoreClick = () => setShowAll(!showAll);

	useUpdateKeyboardNavigation({ synonyms, showAll });

	useLayoutEffect(updateCardPosition, [synonyms, showAll, isLoading, shouldDisplayToggleMore, updateCardPosition]);

	useEffect(moveCardIntoViewport, [synonyms, showAll, isLoading, shouldDisplayToggleMore, moveCardIntoViewport]);

	// Shrink list of displayed suggestions when the word changes...
	useEffect(() => setShowAll(null), [wordContext]);

	// Hide the loader when the word is erroneous and there might be no synonyms available
	if (isLoading && wordIsErroneous !== true) {
		return (
			<CardContent title={title} isIdle={isIdle}>
				<Loader />
			</CardContent>
		);
	}

	// When switching from "Correct" to "Paraphrase" on a misspelled word
	// that does not produce any synonyms, simply do not show this section.
	if (hasNoResults && wordIsErroneous) {
		return null;
	}

	// Set property key on <CardContent /> to force re-render when the tooltip label changes...
	return (
		<CardContent title={title} isIdle={isIdle}>
			<EmptyState noResults={hasNoResults} notSupported={languageNotSupported} />
			{synonyms?.synonymSets
				.slice(0, showAll ? synonyms.synonymSets.length : 1)
				.map((synonymSet, i, { length }, j = length - 1) => (
					<Div
						className={classes(
							"lt-comp-synonyms-content__item",
							shouldDisplayToggleMore && "lt-comp-synonyms-content__item--border",
							i === 0 && "lt-comp-synonyms-content__item--first",
							i === j && "lt-comp-synonyms-content__item--last"
						)}
						key={synonymSet.title + synonymSet.synonyms.map(({ word, hints }) => `${word}-${hints.length}`)}
					>
						<Div className="lt-comp-synonyms-content__item__title">{synonymSet.title}</Div>
						<Alternatives
							alternatives={synonymSet.synonyms}
							showAll={
								showAll || showFullSynonymSetInitially(synonymSet) || shouldDisplayToggleMore === false
							}
							synonymsSource={
								i === j && (showAll || shouldDisplayToggleMore === false) ? synonymsSource : undefined
							}
							onSynonymClick={onSynonymClick}
						/>
					</Div>
				))}
			{shouldDisplayToggleMore && (
				<CardContentToggleMore
					className="lt-comp-synonyms-content__toggle-more"
					data-lt-testid={toggleMoreTestId}
					onToggle={onShowMoreClick}
					showAll={Boolean(showAll)}
				/>
			)}
		</CardContent>
	);
};

export default SynonymsContent;
