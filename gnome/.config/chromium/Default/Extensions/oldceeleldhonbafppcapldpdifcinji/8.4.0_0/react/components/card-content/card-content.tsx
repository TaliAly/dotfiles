import type * as React from "react";
import { useMemo, useRef } from "react";
import { classes } from "../../../common/utils";
import type { IconTooltip } from "../../../components/icon/icon";
import { isFunction, isUndefined } from "../../../core/utils";
import useStopPropagation from "../../hooks/use-stop-propagation";
import { Div, Span, elementFactory, useI18nContext } from "../../index";
import Icon from "../icon/icon";

export interface CardControl {
	key: string;
	icon: string;
	tooltip?: IconTooltip;
	className?: string;
	"data-lt-testid"?: string;
	onClick?: (event: Event) => void;
}

type TitleProps = React.PropsWithChildren<{
	prefix?: string;
}>;

export interface Props {
	className?: string;
	noPadding?: boolean;
	stacked?: boolean;
	title?: React.ReactNode;
	footer?: React.ReactNode;
	caption?: React.ReactNode;
	controls?: Array<CardControl | null>;
	isLoading?: boolean;
	isIdle?: boolean;
}

interface ToggleMoreProps {
	showAll: boolean;
	className?: string;
	"data-lt-testid"?: string;
	onToggle: () => void;
}

const LtCompCardContent = elementFactory("comp-card-content");

export const CardContentTitle: React.FC<TitleProps> = ({ prefix, children }) => {
	return (
		<Div className="lt-comp-card-content__title">
			{prefix && <Div className="lt-comp-card-content__title__prefix">{prefix}</Div>}
			{children}
		</Div>
	);
};

export const CardContentToggleMore: React.FC<ToggleMoreProps> = ({
	showAll,
	className,
	"data-lt-testid": testId,
	onToggle,
}) => {
	const getMessage = useI18nContext();
	const { current: i18n } = useRef<Record<"cardContentShowAll" | "cardContentShowSubset", string>>({
		cardContentShowAll: getMessage("cardContentShowAll"),
		cardContentShowSubset: getMessage("cardContentShowSubset"),
	});
	const handleClick = useStopPropagation(() => {
		onToggle();
	});
	const icon = useMemo(() => {
		if (showAll) {
			return (
				<svg width="12" height="2" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M1 1L11 1" stroke="currentColor" strokeLinecap="round" />
				</svg>
			);
		}

		return (
			<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M6 1L6 11M1 6L11 6" stroke="currentColor" strokeLinecap="round" />
			</svg>
		);
	}, [showAll]);
	const label = showAll ? i18n.cardContentShowSubset : i18n.cardContentShowAll;

	return (
		<Div
			className={classes("lt-comp-card-content__toggle-more", className)}
			onClick={handleClick}
			data-lt-testid={testId}
			data-lt-tabindex="0"
		>
			<Span className="lt-comp-card-content__toggle-more__label">{label}</Span>
			{icon}
		</Div>
	);
};

export const CardContentFooter: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
	className,
	children,
}) => {
	return <Div className={classes("lt-comp-card-content__footer", className)}>{children}</Div>;
};

const CardContent: React.FC<React.PropsWithChildren<Props>> = ({
	className,
	noPadding,
	stacked,
	title = null,
	footer: Footer,
	caption,
	controls: optionalControls = [],
	isLoading = false,
	isIdle = false,
	children,
}) => {
	const controls = optionalControls.filter((o: CardControl | null): o is CardControl => o !== null);
	const hasHeader = useMemo(
		() => isUndefined(caption) === false || Number(controls?.length) > 0,
		[caption, controls]
	);

	return (
		<LtCompCardContent className={className}>
			{title}
			<Div
				className={classes(
					"lt-comp-card-content__wrap",
					noPadding !== true && "lt-comp-card-content__wrap--padding",
					Boolean(stacked) && "lt-comp-card-content__wrap--stacked",
					isLoading && "lt-comp-card-content__wrap--loading",
					isIdle && "lt-comp-card-content__wrap--idle"
				)}
			>
				{hasHeader && (
					<Div className="lt-comp-card-content__header">
						{isUndefined(caption) === false ? (
							<Span className="lt-comp-card-content__caption" data-lt-selectable="true">
								{caption}
							</Span>
						) : (
							<Span>{/* Add an empty element to keep the flex-layout in shape #WTF */}</Span>
						)}
						{Number(controls?.length) > 0 && (
							<Div className="lt-comp-card-content__controls">
								{controls.map(
									({ icon, key, className, "data-lt-testid": testId, onClick, tooltip }) => (
										<Icon
											key={key}
											name={icon}
											className={classes("lt-comp-card-content__control", className)}
											compact={true}
											tooltipInPortal={true}
											data-lt-tabindex={isFunction(onClick) ? "0" : undefined}
											data-lt-testid={testId}
											onClick={onClick}
											tooltip={tooltip}
										/>
									)
								)}
							</Div>
						)}
					</Div>
				)}
				<Div className={classes(noPadding !== true && "lt-comp-card-content__content--padding")}>
					{children}
				</Div>
				{Footer}
				{isIdle && <Div className="lt-comp-card-content__idle" data-lt-testid="card-idle" />}
			</Div>
		</LtCompCardContent>
	);
};

export default CardContent;
