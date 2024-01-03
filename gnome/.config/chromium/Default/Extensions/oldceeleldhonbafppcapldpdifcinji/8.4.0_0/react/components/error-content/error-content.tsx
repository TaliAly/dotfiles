import type * as React from "react";
import { useRef, useMemo, useEffect, Fragment } from "react";
import { classes } from "../../../common/utils";
import { isFunction, isNumber, isString, isUndefined } from "../../../core/utils";
import LTReact, { Div, Span, useI18nContext, useRootContext } from "../../index";
import CardContent, { CardContentFooter, type CardControl } from "../card-content/card-content";
import MascotSays from "../mascot-says/mascot-says";
import { useCaption, useChangeLanguageActionLabel, useFixLabel } from "./hooks";
import { ChangeLanguageAction, ErrorFix } from "./types";
import type { ErrorType, RephraseObject, TextError } from "../../../core/Checker";
import { EnvironmentAdapter } from "../../../common/environmentAdapter";
import getBlogUrl from "../../../common/getBlogUrl";
import Icon from "../icon/icon";
import useStopPropagation from "../../hooks/use-stop-propagation";
import { useEditorCardContext } from "../editor-card/context";
import SentenceSplittingContent from "../sentence-splitting-content/sentence-splitting-content";
import type { UserForRephraseInterface } from "../../../core/Rephrasings";
import { useKeyboardNavigationContext } from "../keyboard-navigation/hooks";
import FixSentenceContent, { type FixSentencePayload } from "../fix-sentence-content/fix-sentence-content";

export interface Props {
	errorId?: string;
	errorType?: ErrorType;
	title?: string;
	description?: string;
	originalPhrase?: string;
	fixes: ErrorFix[];
	changeLanguageAction: ChangeLanguageAction | undefined;
	isHiddenMatch: boolean;
	displayedErrors: TextError[];
	premiumErrors: TextError[];
	showSentenceSplittingSuggestion: boolean;
	inhouseOnly: boolean;
	uniqueId: string;
	showRuleId: boolean;
	language: string;
	user?: UserForRephraseInterface;
	isIdle: boolean;
	fixSentencePayload?: FixSentencePayload;
	onSplitSentenceClick: (phrase: RephraseObject, shouldSelectNextError: boolean) => void;
	onFixSentenceClick: (sentence: FixSentencePayload, phrase: string, shouldSelectNextError: boolean) => void;
	onFixSentenceMouseOver: (includedErrorIds: string[]) => void;
	onFixSentenceMouseOut: () => void;
	onMoreDetailsClick?: () => void;
	onPremiumTeaserClick?: (campaign?: string) => void;
	onAddToDictionaryClick?: (event: Event) => void;
	onIgnoreRule?: (event: Event) => void;
	onIgnoreWordTemporarily?: (event: Event) => void;
	onIgnoreRuleTemporarily?: (event: Event) => void;
	onTurnOffPickyMode?: (event: Event) => void;
}

type DismissButtonProps = Record<
	"onIgnoreWordTemporarily" | "onIgnoreRuleTemporarily",
	((event: Event) => void) | undefined
>;

type EmptyStateProps = Pick<Props, "premiumErrors" | "onPremiumTeaserClick"> & {
	disablePremiumTeaser: boolean;
};

const ErrorFixButton: React.FC<{ fix: ErrorFix }> = ({ fix }) => {
	const label = useFixLabel(fix.type, fix.text, fix.html);
	const handleClick = useStopPropagation(fix.onClick);
	const buttonProps = {
		className: classes(
			"lt-error-content__suggestion",
			fix.type === "highlight" && "lt-error-content__suggestion--highlight",
			fix.type === "remove" && "lt-error-content__suggestion--remove",
			fix.type === "delete" && "lt-error-content__suggestion--delete",
			[
				"replace-hyphen",
				"insert-em-dash",
				"insert-em-dash-with-space",
				"insert-en-dash",
				"remove-whitespace",
			].includes(fix.type as string) && "lt-error-content__suggestion--optional",
			fix.type === "correct-all" && "lt-error-content__suggestion--correct-all"
		),
		title: fix.title,
		"data-lt-tabindex": "0",
		"data-lt-testid": "error-fix",
		onClick: handleClick,
	};

	return fix.html ? (
		<Span {...buttonProps} dangerouslySetInnerHTML={{ __html: fix.html }} />
	) : (
		<Span {...buttonProps}>
			{fix.prefix && <Span className="lt-error-content__suggestion-hint">{fix.prefix}</Span>}
			{label}
			{fix.suffix && <Span className="lt-error-content__suggestion-hint">{fix.suffix}</Span>}
		</Span>
	);
};

const DismissButton: React.FC<DismissButtonProps> = ({ onIgnoreWordTemporarily, onIgnoreRuleTemporarily }) => {
	const baseProps = useMemo(
		() => ({
			className: "lt-error-content__dismiss",
			"data-lt-tabindex": "0",
			children: <LTReact.Tr name="dismissSuggestions" />,
		}),
		[]
	);

	const handleIgnoreWordTemporarily = useStopPropagation((e) => onIgnoreWordTemporarily?.(e));
	const handleIgnoreRuleTemporarily = useStopPropagation((e) => onIgnoreRuleTemporarily?.(e));

	switch (true) {
		case isFunction(onIgnoreWordTemporarily):
			return (
				<Span {...baseProps} data-lt-testid="temporarily-ignore-word" onClick={handleIgnoreWordTemporarily} />
			);
		case isFunction(onIgnoreRuleTemporarily):
			return (
				<Span {...baseProps} data-lt-testid="temporarily-ignore-rule" onClick={handleIgnoreRuleTemporarily} />
			);
		default:
			return null;
	}
};

const SuggestionList: React.FC<Pick<Props, "fixes" | "changeLanguageAction">> = ({ fixes, changeLanguageAction }) => {
	const changeLanguageActionLabel = useChangeLanguageActionLabel(changeLanguageAction);
	const handleChangeLanguage = useStopPropagation(() => {
		changeLanguageAction?.onClick();
	});

	return (
		<>
			{fixes.map((fix) => (
				<Fragment key={fix.text + fix.html}>
					<ErrorFixButton fix={fix} />
					{fix.type === "correct-all" && <br />}
				</Fragment>
			))}
			{changeLanguageAction && (
				<Span
					className="lt-error-content__suggestion lt-error-content__suggestion--optional"
					onClick={handleChangeLanguage}
					data-lt-tabindex="0"
					data-lt-testid="error-fix"
				>
					{changeLanguageActionLabel}
				</Span>
			)}
		</>
	);
};

const EmptyState: React.FC<EmptyStateProps> = ({ premiumErrors, disablePremiumTeaser, onPremiumTeaserClick }) => {
	const getMessage = useI18nContext();
	const { current: i18n } = useRef<
		Record<
			| "errorCardAllDoneCaption"
			| "errorCardAllDoneDescription"
			| "errorCardPremiumTeaserCaptionSingular"
			| "errorCardPremiumTeaserText"
			| "errorCardPremiumTeaserReadMore"
			| "errorCardPremiumTeaserGrammarSuggestions"
			| "errorCardPremiumTeaserStyleSuggestions"
			| "errorCardPremiumTeaserPunctuationSuggestions"
			| "errorCardPremiumTeaserCta",
			string
		>
	>({
		errorCardAllDoneCaption: getMessage("errorCardAllDoneCaption"),
		errorCardAllDoneDescription: getMessage("errorCardAllDoneDescription"),
		errorCardPremiumTeaserCaptionSingular: getMessage("errorCardPremiumTeaserCaptionSingular"),
		errorCardPremiumTeaserText: getMessage("errorCardPremiumTeaserText"),
		errorCardPremiumTeaserReadMore: getMessage("errorCardPremiumTeaserReadMore"),
		errorCardPremiumTeaserGrammarSuggestions: getMessage("errorCardPremiumTeaserGrammarSuggestions"),
		errorCardPremiumTeaserStyleSuggestions: getMessage("errorCardPremiumTeaserStyleSuggestions"),
		errorCardPremiumTeaserPunctuationSuggestions: getMessage("errorCardPremiumTeaserPunctuationSuggestions"),
		errorCardPremiumTeaserCta: getMessage("errorCardPremiumTeaserCta"),
	});
	const premiumTeaserCaptionPlural = useMemo(
		() => getMessage("errorCardPremiumTeaserCaptionPlural", [premiumErrors.length]),
		[getMessage, premiumErrors]
	);
	const { length: grammarErrors } = premiumErrors.filter(
		(error) => !error.isPunctuationError && !error.isStyleError && !error.isSpellingError
	);
	const { length: styleErrors } = premiumErrors.filter((error) => error.isStyleError);
	const { length: punctuationErrors } = premiumErrors.filter((error) => error.isPunctuationError);
	const { length: amountCategories } = [grammarErrors, styleErrors, punctuationErrors].filter((amount) => amount > 0);
	const handleLinkClick = useStopPropagation(() => {
		EnvironmentAdapter.openWindow(getBlogUrl("post/premium-vs-free-product-updates/"));
	});
	const handleCtaClick = useStopPropagation(() => {
		onPremiumTeaserClick?.("addon2-errorcard-hidden-matches");
	});

	if (!premiumErrors.length || disablePremiumTeaser === true) {
		return (
			<MascotSays type="happy" caption={i18n.errorCardAllDoneCaption} text={i18n.errorCardAllDoneDescription} />
		);
	}

	return (
		<Div className="lt-error-teaser">
			<Div className="lt-error-teaser__caption">
				{premiumErrors.length === 1 ? i18n.errorCardPremiumTeaserCaptionSingular : premiumTeaserCaptionPlural}
			</Div>
			<Div className="lt-error-teaser__content">
				<Span className="lt-error-teaser__text">{i18n.errorCardPremiumTeaserText}</Span>
				<> {/* Breaking white-space... */}</>
				<Span className="lt-error-teaser__read-more" onClick={handleLinkClick}>
					{i18n.errorCardPremiumTeaserReadMore}
				</Span>
			</Div>
			{amountCategories > 1 && (
				<Div>
					{grammarErrors > 0 && (
						<Div className="lt-error-teaser__stats-row">
							<Span
								className="lt-error-teaser__stats-key"
								dangerouslySetInnerHTML={{ __html: i18n.errorCardPremiumTeaserGrammarSuggestions }}
							/>
							<Span className="lt-error-teaser__stats-value">{grammarErrors}</Span>
						</Div>
					)}
					{styleErrors > 0 && (
						<Div className="lt-error-teaser__stats-row">
							<Span
								className="lt-error-teaser__stats-key"
								dangerouslySetInnerHTML={{ __html: i18n.errorCardPremiumTeaserStyleSuggestions }}
							/>
							<Span className="lt-error-teaser__stats-value">{styleErrors}</Span>
						</Div>
					)}
					{punctuationErrors > 0 && (
						<Div className="lt-error-teaser__stats-row">
							<Span
								className="lt-error-teaser__stats-key"
								dangerouslySetInnerHTML={{ __html: i18n.errorCardPremiumTeaserPunctuationSuggestions }}
							/>
							<Span className="lt-error-teaser__stats-value">{punctuationErrors}</Span>
						</Div>
					)}
				</Div>
			)}
			<Div className="lt-error-teaser__cta" onClick={handleCtaClick}>
				{i18n.errorCardPremiumTeaserCta}
			</Div>
		</Div>
	);
};

const ErrorContentFooter: React.FC<Pick<Props, "isHiddenMatch" | "onTurnOffPickyMode" | "onPremiumTeaserClick">> = ({
	isHiddenMatch,
	onPremiumTeaserClick,
	onTurnOffPickyMode,
}) => {
	const getMessage = useI18nContext();
	const { current: i18n } = useRef<
		Record<
			| "errorCardHiddenMatchButton"
			| "errorCardHiddenMatchCaption"
			| "errorCardTurnOffPickyModeButton"
			| "errorCardTurnOffPickyModeCaption",
			string
		>
	>({
		errorCardHiddenMatchButton: getMessage("errorCardTurnOffPickyModeButton"),
		errorCardHiddenMatchCaption: getMessage("errorCardTurnOffPickyModeCaption"),
		errorCardTurnOffPickyModeButton: getMessage("errorCardTurnOffPickyModeButton"),
		errorCardTurnOffPickyModeCaption: getMessage("errorCardTurnOffPickyModeCaption"),
	});
	let modifier: string;
	let icon: string;
	let caption: string;
	let buttonText: string;
	let handleClick: (event: Event) => void;

	switch (true) {
		case isHiddenMatch && isFunction(onPremiumTeaserClick):
			modifier = "lt-error-content__footer--premium";
			icon = "premium--small";
			caption = i18n.errorCardHiddenMatchCaption;
			buttonText = i18n.errorCardHiddenMatchButton;
			handleClick = (event) => {
				event.stopImmediatePropagation();
				onPremiumTeaserClick?.();
			};
			break;
		case isFunction(onTurnOffPickyMode):
			modifier = "lt-error-content__footer--picky";
			icon = "picky--blue";
			caption = i18n.errorCardTurnOffPickyModeCaption;
			buttonText = i18n.errorCardTurnOffPickyModeButton;
			handleClick = (event) => {
				event.stopImmediatePropagation();
				onTurnOffPickyMode?.(event);
			};
			break;
		default:
			return null;
	}

	return (
		<CardContentFooter className={classes("lt-error-content__footer", modifier)}>
			<Div className="lt-error-content__footer__caption">
				<Icon name={icon} compact={true} />
				{caption}
			</Div>
			<Div className="lt-error-content__footer__btn" onClick={handleClick}>
				{buttonText}
			</Div>
		</CardContentFooter>
	);
};

const ErrorContent: React.FC<Props> = ({
	showSentenceSplittingSuggestion: optionallyShowSentenceSplittingSuggestion,
	errorId,
	errorType,
	title,
	description,
	originalPhrase,
	fixes,
	changeLanguageAction,
	isHiddenMatch,
	premiumErrors,
	language,
	inhouseOnly,
	uniqueId,
	showRuleId,
	user,
	isIdle,
	fixSentencePayload,
	onSplitSentenceClick,
	onFixSentenceClick,
	onFixSentenceMouseOver,
	onFixSentenceMouseOut,
	onMoreDetailsClick,
	onPremiumTeaserClick,
	onAddToDictionaryClick,
	onIgnoreWordTemporarily,
	onIgnoreRule,
	onIgnoreRuleTemporarily,
	onTurnOffPickyMode,
}) => {
	const { isInDOM } = useRootContext();
	const { disablePremiumTeaser } = useEditorCardContext();
	const hasError = useMemo(() => isString(description) && isString(originalPhrase), [description, originalPhrase]);
	const hasPremiumErrorsOnly = useMemo(
		() => hasError === false && premiumErrors.length > 0,
		[hasError, premiumErrors]
	);
	const caption = useCaption(
		title,
		errorType,
		optionallyShowSentenceSplittingSuggestion,
		hasError,
		hasPremiumErrorsOnly,
		disablePremiumTeaser
	);
	const getMessage = useI18nContext();
	const { current: i18n } = useRef<Record<"turnOffRule" | "moreDetails" | "turnOffPickyMode", string>>({
		turnOffRule: getMessage("turnOffRule"),
		moreDetails: getMessage("moreDetails"),
		turnOffPickyMode: getMessage("turnOffPickyMode"),
	});
	const initialFocusIndex = useRef<number | null>(0);
	const { setFocusIndex, setButtonGroupHash } = useKeyboardNavigationContext();
	const showSentenceSplittingSuggestion = isString(originalPhrase) && optionallyShowSentenceSplittingSuggestion;
	const handleAddToDictionaryClick = useStopPropagation((event: Event) => {
		onAddToDictionaryClick?.(event);
	});
	const AddToDictionary: CardControl | null = isFunction(onAddToDictionaryClick)
		? {
				key: "add-to-dictionary",
				icon: "dictionary",
				"data-lt-testid": "add-to-dictionary",
				onClick: handleAddToDictionaryClick,
				tooltip: { label: getMessage("addToDictionaryCaption", originalPhrase), position: "top-right" },
		  }
		: null;
	const handleIgnoreRule = useStopPropagation((event: Event) => {
		onIgnoreRule?.(event);
	});
	const IgnoreRule: CardControl | null = isFunction(onIgnoreRule)
		? {
				key: "add-to-dictionary",
				icon: "ignore",
				"data-lt-testid": "ignore-rule",
				onClick: handleIgnoreRule,
				tooltip: { label: i18n.turnOffRule, position: "top-right" },
		  }
		: null;
	const handleMoreDetailsClick = useStopPropagation(() => {
		onMoreDetailsClick?.();
	});
	const MoreDetails: CardControl | null = isFunction(onMoreDetailsClick)
		? {
				key: "more-details",
				icon: "info",
				"data-lt-testid": "more-details",
				onClick: handleMoreDetailsClick,
				tooltip: { label: i18n.moreDetails, position: "top-right" },
		  }
		: null;
	const Footer = useMemo(
		() => (
			<ErrorContentFooter
				isHiddenMatch={isHiddenMatch}
				onPremiumTeaserClick={onPremiumTeaserClick}
				onTurnOffPickyMode={onTurnOffPickyMode}
			/>
		),
		[isHiddenMatch, onPremiumTeaserClick, onTurnOffPickyMode]
	);

	let cardControls: (CardControl | null)[] | undefined = undefined;
	if (hasError) {
		cardControls = [MoreDetails, IgnoreRule, AddToDictionary];
	}
	if (hasPremiumErrorsOnly && disablePremiumTeaser !== true) {
		cardControls = [
			{
				icon: "premium",
				key: "premium-icon",
				className: "lt-error-content__premium-icon",
			},
		];
	}
	// Store the initial keyboard navigation focus on the first suggestion,
	// which is the first interactive element after the Card Controls in the DOM
	initialFocusIndex.current = cardControls?.filter(Boolean).length ?? 0;

	if (isUndefined(caption) && hasError) {
		throw new Error("Either `caption` or `errorType` need to be passed into the ErrorContent component");
	}

	useEffect(() => {
		if (!isInDOM) {
			return;
		}

		const buttonGroupHash = fixes
			.map((fix) => fix.text || fix.html)
			.concat([String(errorId)])
			.join("_");

		// Set the initial focus index before the button group
		// hash is propagated because setting the index won't make
		// the keyboard navigation component reset it's current focus.
		if (isNumber(initialFocusIndex.current)) {
			setFocusIndex(initialFocusIndex.current);
			initialFocusIndex.current = null;
		}

		// Propagate the change of visible interactive elements
		// to the keyboard navigation component.
		setButtonGroupHash(buttonGroupHash);
	}, [isInDOM, errorId, fixes, setButtonGroupHash, setFocusIndex]);

	return (
		<Div>
			<CardContent caption={caption} controls={cardControls} footer={Footer} isIdle={isIdle}>
				<Div className="lt-error-content__description" data-lt-selectable="true">
					{description}
				</Div>
				<Div className="lt-error-content__actions-list">
					<SuggestionList fixes={fixes} changeLanguageAction={changeLanguageAction} />
					<DismissButton
						onIgnoreWordTemporarily={onIgnoreWordTemporarily}
						onIgnoreRuleTemporarily={onIgnoreRuleTemporarily}
					/>
				</Div>
				{!showSentenceSplittingSuggestion && !hasError && (
					<EmptyState
						premiumErrors={premiumErrors}
						disablePremiumTeaser={disablePremiumTeaser}
						onPremiumTeaserClick={onPremiumTeaserClick}
					/>
				)}
			</CardContent>
			{isString(originalPhrase) && showSentenceSplittingSuggestion && (
				<SentenceSplittingContent
					inhouseOnly={inhouseOnly}
					uniqueId={uniqueId}
					showRuleId={showRuleId}
					sentence={originalPhrase}
					language={language}
					isIdle={isIdle}
					user={user}
					onSuggestionClick={onSplitSentenceClick}
				/>
			)}
			{!showSentenceSplittingSuggestion && fixSentencePayload && (
				<FixSentenceContent
					sentence={fixSentencePayload}
					isIdle={isIdle}
					showRuleId={showRuleId}
					onSuggestionClick={onFixSentenceClick}
					onSuggestionMouseOver={onFixSentenceMouseOver}
					onSuggestionMouseOut={onFixSentenceMouseOut}
				/>
			)}
		</Div>
	);
};

export default ErrorContent;
