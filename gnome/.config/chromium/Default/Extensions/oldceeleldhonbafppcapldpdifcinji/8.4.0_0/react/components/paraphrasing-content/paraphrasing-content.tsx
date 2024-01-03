import type * as React from "react";
import { useRef, useState, useMemo, useEffect, useLayoutEffect, Fragment } from "react";
import type { RephraseResult } from "../../../core/Checker";
import { useI18nContext, Div, Span } from "../../index";
import CardContent, { CardContentTitle, CardContentToggleMore } from "../card-content/card-content";
import { useLoadParaphrasings, useUpdateKeyboardNavigation } from "./hooks";
import { MAX_RESULTS, showAllResultsInitally } from "./util";
import { ParaphrasingContentData } from "./types";
import DiffComponent from "../diff/diff";
import { classes } from "../../../common/utils";
import { uniq } from "../../../core/utils";
import { BrowserDetector } from "../../../common/browserDetector";
import RephrasingTeaser from "../../components/rephrasing-teaser/rephrasing-teaser";
import MascotSays from "../mascot-says/mascot-says";
import { useBaseCardContext } from "../card-base/hooks";
import { Tracker } from "../../../common/tracker";
import useStopPropagation from "../../hooks/use-stop-propagation";
import usePrivacyConfirmation from "../../hooks/use-privacy-confirmation";

type Props = ParaphrasingContentData & {
	noDistanceTop: boolean;
};

type AlternativeProps = Pick<Props, "sentence" | "onPhraseClick"> &
	RephraseResult["rephrases"][number] & {
		isFirst: boolean;
		isLast: boolean;
		isRuleDeveloperDebugMode: boolean;
		reportPhrase: () => void;
	};

type ParaphraseType = "formality" | "general" | "paraphrase" | "shortened" | "simplicity";

interface FilterProps {
	hidden?: boolean;
	current: ParaphraseType | null;
	isIdle: boolean;
	availableFilters: ParaphraseType[] | undefined;
	onChange: (type: ParaphraseType | null) => void;
}

type FilterItemProps = Pick<FilterProps, "current" | "onChange"> & {
	type: ParaphraseType | null;
	getLabel: (id: string | null) => string;
};

const PREMIUM_URL = "https://languagetool.org/premium?utm_campaign=addon2-rewriting";

const getAvailableFiltersFromPhrases = (paraphrasings: RephraseResult | undefined): ParaphraseType[] => {
	return uniq(
		paraphrasings?.rephrases
			.map(({ label: l }) => l.split("-").shift() as string)
			.filter((l): l is ParaphraseType => PARAPHRASING_TYPES.includes(l as ParaphraseType)) || []
	);
};

const Loader: React.FC = () => {
	const rows = ["one", "two", "three"];
	const sentence = (
		<Div className="lt-comp-paraphrasing-content__loading" data-lt-testid="loading-skeleton">
			<Span className="lt-comp-paraphrasing-content__loading__line" />
			<Span className="lt-comp-paraphrasing-content__loading__line" />
		</Div>
	);

	return (
		<>
			{rows.map((key) => (
				<Fragment key={key}>{sentence}</Fragment>
			))}
		</>
	);
};

const Alternative: React.FC<AlternativeProps> = ({
	sentence,
	label,
	origin,
	score,
	text: paraphrasedSentence,
	uuid,
	isLast,
	isFirst,
	isRuleDeveloperDebugMode,
	onPhraseClick,
	reportPhrase,
}) => {
	const handleClick = useStopPropagation(() => {
		onPhraseClick({ label, origin, score, text: paraphrasedSentence, uuid });
		reportPhrase();
	});

	return (
		<Div
			className={classes(
				"lt-comp-paraphrasing-content__item",
				isFirst && "lt-comp-paraphrasing-content__item--first-element",
				isLast && "lt-comp-paraphrasing-content__item--last-element"
			)}
			onClick={handleClick}
			data-lt-testid="rephrase-suggestion"
			data-lt-tabindex="0"
		>
			{isRuleDeveloperDebugMode && <Span className="lt-comp-paraphrasing-content__item__origin">{label}</Span>}
			<DiffComponent
				from={sentence}
				to={paraphrasedSentence}
				className="lt-comp-paraphrasing-content__item__diff"
			/>
		</Div>
	);
};

const PARAPHRASING_TYPES: ParaphraseType[] = ["formality", "general", "paraphrase", "shortened", "simplicity"];

const FilterItem: React.FC<FilterItemProps> = ({ type, current, onChange, getLabel }) => {
	const handleClick = useStopPropagation(() => onChange(type));

	return (
		<Div
			className={classes(
				"lt-comp-paraphrasing-content__filter__list__item",
				type === current && "lt-comp-paraphrasing-content__filter__list__item--current"
			)}
			onClick={handleClick}
		>
			{getLabel(type)}
		</Div>
	);
};

const Filter: React.FC<FilterProps> = ({ hidden, current, isIdle, availableFilters, onChange }) => {
	const { updateCardPosition, moveCardIntoViewport } = useBaseCardContext();
	const getMessage = useI18nContext();
	const { current: i18n } = useRef<
		Record<
			| "phrasesCardLabelFormality"
			| "phrasesCardLabelParaphrase"
			| "phrasesCardLabelShortened"
			| "phrasesCardLabelSimplicity"
			| "phrasesCardLabelGeneral"
			| "phrasesCardFilterEmpty",
			string
		>
	>({
		phrasesCardLabelFormality: getMessage("phrasesCardLabelFormality"),
		phrasesCardLabelParaphrase: getMessage("phrasesCardLabelParaphrase"),
		phrasesCardLabelShortened: getMessage("phrasesCardLabelShortened"),
		phrasesCardLabelSimplicity: getMessage("phrasesCardLabelSimplicity"),
		phrasesCardLabelGeneral: getMessage("phrasesCardLabelGeneral"),
		phrasesCardFilterEmpty: getMessage("phrasesCardFilterEmpty"),
	});
	const { current: getLabel } = useRef((type: ParaphraseType | null) => {
		switch (type) {
			case "formality":
				return i18n.phrasesCardLabelFormality;
			case "general":
				return i18n.phrasesCardLabelGeneral;
			case "paraphrase":
				return i18n.phrasesCardLabelParaphrase;
			case "shortened":
				return i18n.phrasesCardLabelShortened;
			case "simplicity":
				return i18n.phrasesCardLabelSimplicity;
			default:
				return i18n.phrasesCardFilterEmpty;
		}
	});
	const [isMenuVisible, setMenuVisibility] = useState(false);
	const handleLabelClick = () => setMenuVisibility(true);
	const handleBackdropClick = useStopPropagation(() => setMenuVisibility(false));
	const minimumAmountOfOptions = current === null ? 2 : 1;
	const isHidden = hidden === true || !availableFilters || availableFilters.length < minimumAmountOfOptions;

	useLayoutEffect(updateCardPosition, [isHidden, updateCardPosition]);

	useEffect(moveCardIntoViewport, [isHidden, moveCardIntoViewport]);

	if (isHidden) {
		return null;
	}

	return (
		<>
			<Div
				className={classes(
					"lt-comp-paraphrasing-content__filter",
					isIdle && "lt-comp-paraphrasing-content__filter--idle"
				)}
			>
				<Div className="lt-comp-paraphrasing-content__filter__label" onClick={handleLabelClick}>
					{getLabel(current)}
				</Div>
				<Div
					className={classes(
						"lt-comp-paraphrasing-content__filter__list",
						isMenuVisible && "lt-comp-paraphrasing-content__filter__list--visble"
					)}
				>
					{[null, ...availableFilters].map((type) => (
						<FilterItem
							type={type}
							current={current}
							key={String(type)}
							onChange={onChange}
							getLabel={getLabel}
						/>
					))}
				</Div>
			</Div>
			{isMenuVisible && (
				<Div className="lt-comp-paraphrasing-content__filter-backdrop" onClick={handleBackdropClick} />
			)}
		</>
	);
};

const privacyURL = BrowserDetector.isSafari()
	? "https://languagetool.org/legal/privacy/?hidePremium=true#rephrasing"
	: "https://languagetool.org/legal/privacy/#rephrasing";

const PrivacyConfirmation: React.FC<Pick<Props, "language"> & { onConfirmPrivacyPolicy: (e: Event) => void }> = ({
	language,
	onConfirmPrivacyPolicy,
}) => {
	const getMessage = useI18nContext();
	const { current: i18n } = useRef<
		Record<
			"phrasesCardConfirmationHeading" | "phrasesCardConfirmationText" | "phrasesCardConfirmationButton",
			string
		>
	>({
		phrasesCardConfirmationHeading: getMessage("phrasesCardConfirmationHeading"),
		phrasesCardConfirmationText: getMessage("phrasesCardConfirmationText", [privacyURL]),
		phrasesCardConfirmationButton: getMessage("phrasesCardConfirmationButton"),
	});

	return (
		<Div className="lt-comp-paraphrasing-content__confirmation">
			<Div
				className={classes(
					"lt-comp-paraphrasing-content__confirmation__image",
					`lt-comp-paraphrasing-content__confirmation__image--${language}`
				)}
			/>
			<Div className="lt-comp-paraphrasing-content__confirmation__content">
				<Div className="lt-comp-paraphrasing-content__confirmation__heading">
					{i18n.phrasesCardConfirmationHeading}
				</Div>
				<Div
					className="lt-comp-paraphrasing-content__confirmation__text"
					dangerouslySetInnerHTML={{ __html: i18n.phrasesCardConfirmationText }}
				/>
				<Span
					className="lt-comp-paraphrasing-content__confirmation__button"
					onClick={onConfirmPrivacyPolicy}
					data-lt-testid="confirm-tos"
				>
					{i18n.phrasesCardConfirmationButton}
				</Span>
			</Div>
		</Div>
	);
};

// Currently disabled as monetization is not the current focus of this feature
// We can enable this teaser after the feature is stable and has been introduced to all users
const RemainingRephrasingsHint: React.FC<{ remainingRephrasings: number }> = ({ remainingRephrasings }) => {
	const getMessage = useI18nContext();
	const i18n = useMemo<
		Record<
			| "phrasesCardRephrasingLimitSingular"
			| "phrasesCardRephrasingLimitPlural"
			| "phrasesCardRephrasingLimitUnlock",
			string
		>
	>(
		() => ({
			phrasesCardRephrasingLimitSingular: getMessage("phrasesCardRephrasingLimitSingular"),
			phrasesCardRephrasingLimitPlural: getMessage("phrasesCardRephrasingLimitPlural", [remainingRephrasings]),
			phrasesCardRephrasingLimitUnlock: getMessage("phrasesCardRephrasingLimitUnlock"),
		}),
		[getMessage, remainingRephrasings]
	);
	const html =
		remainingRephrasings === 1 ? i18n.phrasesCardRephrasingLimitSingular : i18n.phrasesCardRephrasingLimitPlural;

	// TODO: Remove this when the translations have been updated.
	//       Which again will happen when the old Rephrase Card got replaced by the React-based one.
	const addTrailingDot = (s: string) => (s + ".").replace(/\.+$/, ".");
	const handleClick = () => self.open(PREMIUM_URL, "_blank");

	return (
		<Div className="lt-comp-paraphrasing-content__rephrasing-hint" onClick={handleClick}>
			<Span
				className="lt-comp-paraphrasing-content__rephrasing-hint__text"
				dangerouslySetInnerHTML={{ __html: addTrailingDot(html) }}
			/>
			<Span className="lt-comp-paraphrasing-content__rephrasing-hint__cta">
				{i18n.phrasesCardRephrasingLimitUnlock}
			</Span>
		</Div>
	);
};

const ParaphrasingContent: React.FC<Props> = ({
	inhouseOnly,
	isEnabled,
	language,
	sentence,
	uniqueId,
	user,
	remainingRephrasings,
	noDistanceTop,
	showRuleId,
	isIdle,
	onPhraseClick,
	reportPhrase,
	highlightSentence,
}) => {
	const { updateCardPosition, moveCardIntoViewport } = useBaseCardContext();
	const getMessage = useI18nContext();
	const { current: i18n } = useRef<
		Record<
			| "phrasesCardHeadline"
			| "phrasesCardSentencePrefix"
			| "synonymsCardLoading"
			| "phrasesCardNoSentence"
			| "phrasesCardNoResult"
			| "phrasesCardNotSupportedHeading"
			| "phrasesCardNotSupportedText"
			| "phrasesCardRephrasingLimitSingular"
			| "phrasesCardGeneralError",
			string
		>
	>({
		phrasesCardHeadline: getMessage("phrasesCardHeadline"),
		phrasesCardSentencePrefix: getMessage("phrasesCardSentencePrefix"),
		synonymsCardLoading: getMessage("synonymsCardLoading"),
		phrasesCardNoSentence: getMessage("phrasesCardNoSentence"),
		phrasesCardNoResult: getMessage("phrasesCardNoResult"),
		phrasesCardNotSupportedHeading: getMessage("phrasesCardNotSupportedHeading"),
		phrasesCardNotSupportedText: getMessage("phrasesCardNotSupportedText"),
		phrasesCardRephrasingLimitSingular: getMessage("phrasesCardRephrasingLimitSingular"),
		phrasesCardGeneralError: getMessage("phrasesCardGeneralError"),
	});
	const [isAllowed, onConfirmPrivacyPolicy] = usePrivacyConfirmation(isEnabled, inhouseOnly, language, "rephrasesV3");
	const handlePrivacyConfirmation = useStopPropagation(onConfirmPrivacyPolicy);
	const [paraphrasings, isLoading, error] = useLoadParaphrasings({
		shouldLoadData: isAllowed && isEnabled && (remainingRephrasings === null || remainingRephrasings > 0),
		inhouseOnly,
		language,
		sentence,
		uniqueId,
		user,
	});
	const [currentFilter, setCurrentFilter] = useState<ParaphraseType | null>(null);
	const [showAll, setShowAll] = useState(false);
	const phrases = paraphrasings?.rephrases.filter(({ label }) => !currentFilter || label.startsWith(currentFilter));
	const shouldShowAllResults = showAllResultsInitally(phrases);
	const shouldDisplayToggleMore =
		shouldShowAllResults === false && Array.isArray(phrases) && phrases.length > MAX_RESULTS;
	const hasInteractedWithToggleMoreButton = useUpdateKeyboardNavigation({
		phrases,
		showAll,
		shouldShowAllResults,
	});
	const title = useMemo<React.ReactNode>(
		() => (
			<CardContentTitle>
				<Span className="lt-comp-paraphrasing-content__title">{i18n.phrasesCardHeadline}</Span>
				<Filter
					hidden={!paraphrasings || paraphrasings.rephrases.length === 0}
					current={currentFilter}
					isIdle={isIdle}
					availableFilters={getAvailableFiltersFromPhrases(paraphrasings)}
					onChange={setCurrentFilter}
				/>
			</CardContentTitle>
		),
		[paraphrasings, currentFilter, isIdle, setCurrentFilter, i18n.phrasesCardHeadline]
	);
	const Wrap = useMemo<React.FC<React.PropsWithChildren>>(
		() =>
			function Wrap({ children }: React.PropsWithChildren) {
				return (
					<CardContent
						title={title}
						className={classes(
							"lt-comp-paraphrasing-content",
							noDistanceTop && "lt-comp-paraphrasing-content--no-distance-top"
						)}
						noPadding={true}
						isIdle={isIdle}
					>
						{children}
					</CardContent>
				);
			},
		[title, noDistanceTop, isIdle]
	);
	const handleTeaserCtaClick = () => {
		self.open(PREMIUM_URL, "_blank");
	};
	const onShowMoreClick = () => {
		setShowAll(!showAll);
		hasInteractedWithToggleMoreButton.current = true;
	};

	useEffect(() => {
		Tracker.trackEvent("Action", "rephrasesV3:open", language + ":" + (isEnabled ? "enabled" : "disabled"));
	}, [language, isEnabled]);

	useEffect(() => {
		const filter = currentFilter || "default";
		Tracker.trackEvent("Action", "rephrasesV3:set_filter", filter);
	}, [currentFilter]);

	useLayoutEffect(highlightSentence, [highlightSentence]);

	// Reset the pagination with every new sentence being paraphrased...
	useEffect(() => {
		setShowAll(false);
	}, [paraphrasings]);

	useLayoutEffect(updateCardPosition, [paraphrasings, showAll, currentFilter, isAllowed, updateCardPosition]);

	useEffect(moveCardIntoViewport, [paraphrasings, showAll, currentFilter, isAllowed, moveCardIntoViewport]);

	useEffect(() => setCurrentFilter(null), [sentence]);

	if (!isEnabled) {
		return (
			<Wrap>
				<MascotSays
					type="sad"
					caption={i18n.phrasesCardNotSupportedHeading}
					html={i18n.phrasesCardNotSupportedText}
				/>
			</Wrap>
		);
	}

	if (!isAllowed) {
		return (
			<Wrap>
				<PrivacyConfirmation language={language} onConfirmPrivacyPolicy={handlePrivacyConfirmation} />
			</Wrap>
		);
	}

	if (remainingRephrasings === 0) {
		return (
			<CardContent className="lt-comp-paraphrasing-content" isIdle={isIdle}>
				<RephrasingTeaser language={language} onCtaClick={handleTeaserCtaClick} />
			</CardContent>
		);
	}

	if (isLoading) {
		return (
			<Wrap>
				<Loader />
			</Wrap>
		);
	}

	if (error || !phrases) {
		return (
			<Wrap>
				<MascotSays type="error" caption={error?.message || i18n.phrasesCardGeneralError} />
			</Wrap>
		);
	}

	if (phrases.length === 0) {
		return (
			<Wrap>
				<MascotSays caption={i18n.phrasesCardNoResult} />
			</Wrap>
		);
	}

	return (
		<Wrap>
			<Div className="lt-comp-paraphrasing-content__items" data-lt-testid="rephrase-list">
				{phrases
					.slice(0, showAll ? phrases.length : MAX_RESULTS)
					.map((phrase, i, { length }, j = length - 1) => (
						<Alternative
							{...phrase}
							key={phrase.uuid}
							sentence={sentence}
							isLast={i === j && shouldDisplayToggleMore === false}
							isFirst={i === 0}
							isRuleDeveloperDebugMode={showRuleId}
							onPhraseClick={onPhraseClick}
							reportPhrase={() => reportPhrase(paraphrasings!, i)}
						/>
					))}
			</Div>
			{shouldDisplayToggleMore && (
				<CardContentToggleMore
					className="lt-comp-paraphrasing-content__toggle-more"
					onToggle={onShowMoreClick}
					showAll={Boolean(showAll)}
				/>
			)}
		</Wrap>
	);
};

export default ParaphrasingContent;
