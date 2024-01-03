import type * as React from "react";
import { useRef } from "react";
import * as config from "../../../config/config";
import useStopPropagation from "../../hooks/use-stop-propagation";
import { Div, Span, elementFactory, useI18nContext } from "../../index";
import Countdown from "../countdown/countdown";

interface Props {
	language: string;
	onCtaClick: () => void;
}

const LtCompRephrasingTeaser = elementFactory("comp-rephrasing-teaser");

const useExpiryTimestamp = () => {
	const { current: now } = useRef(new Date());
	now.setHours(23);
	now.setMinutes(59);
	now.setSeconds(59);
	now.setMilliseconds(999);

	return now.getTime();
};

const RephrasingTeaser: React.FC<Props> = ({ language, onCtaClick }) => {
	const getMessage = useI18nContext();
	const { current: i18n } = useRef<
		Record<
			| "rephrasingTeaserCountdownText"
			| "rephrasingTeaserCountdownSuffix"
			| "rephrasingTeaserCaption"
			| "rephrasingTeaserDescription"
			| "rephrasingTeaserListItem1"
			| "rephrasingTeaserListItem2"
			| "rephrasingTeaserListItem3"
			| "rephrasingTeaserCta",
			string
		>
	>({
		rephrasingTeaserCountdownText: getMessage("rephrasingTeaserCountdownText"),
		rephrasingTeaserCountdownSuffix: getMessage("rephrasingTeaserCountdownSuffix", [
			config.MAX_FREEMIUM_REPHRASINGS_PER_DAY,
		]),
		rephrasingTeaserCaption: getMessage("rephrasingTeaserCaption"),
		rephrasingTeaserDescription: getMessage("rephrasingTeaserDescription"),
		rephrasingTeaserListItem1: getMessage("rephrasingTeaserListItem1", [
			config.MAX_TEXT_LENGTH_PREMIUM.toLocaleString(language || undefined),
		]),
		rephrasingTeaserListItem2: getMessage("rephrasingTeaserListItem2"),
		rephrasingTeaserListItem3: getMessage("rephrasingTeaserListItem3"),
		rephrasingTeaserCta: getMessage("rephrasingTeaserCta"),
	});
	const expires = useExpiryTimestamp();
	const listItems = [i18n.rephrasingTeaserListItem1, i18n.rephrasingTeaserListItem2, i18n.rephrasingTeaserListItem3];
	const handleCtaClick = useStopPropagation(() => {
		onCtaClick();
	});

	return (
		<LtCompRephrasingTeaser>
			<Div className="lt-comp-rephrasing-teaser__header">
				<Div className="lt-comp-rephrasing-teaser__countdown">
					{i18n.rephrasingTeaserCountdownText}
					<Span className="lt-comp-rephrasing-teaser__countdown__suffix">
						{i18n.rephrasingTeaserCountdownSuffix}
					</Span>
				</Div>
				<Countdown
					expires={expires}
					digitClass="lt-comp-rephrasing-teaser__timer__digit"
					dividerClass="lt-comp-rephrasing-teaser__timer__divider"
				/>
			</Div>
			<Div className="lt-comp-rephrasing-teaser__caption">{i18n.rephrasingTeaserCaption}</Div>
			<Div className="lt-comp-rephrasing-teaser__description">{i18n.rephrasingTeaserDescription}</Div>
			<Div className="lt-comp-rephrasing-teaser__list">
				{listItems.map((text) => (
					<Span
						className="lt-comp-rephrasing-teaser__list-item"
						key={text}
						dangerouslySetInnerHTML={{ __html: text }}
					/>
				))}
			</Div>
			<Span className="lt-comp-rephrasing-teaser__cta" onClick={handleCtaClick}>
				{i18n.rephrasingTeaserCta}
			</Span>
		</LtCompRephrasingTeaser>
	);
};

export default RephrasingTeaser;
