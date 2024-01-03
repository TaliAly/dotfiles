import type * as React from "react";
import { useEffect, useState, useRef } from "react";
import { classes, createContainerElement, isRectsIntersect } from "../../../common/utils";
import { Div, Span, elementFactory } from "../../index";
import type { IconTooltip } from "../../../components/icon/icon";
import { DomMeasurement } from "../../../common/domMeasurement";
import useStopPropagation from "../../hooks/use-stop-propagation";
import { isFunction } from "../../../core/utils";

export interface Props {
	name: string;
	label?: string;
	className?: string;
	tooltip?: IconTooltip;
	tooltipInPortal?: boolean;
	compact?: boolean;
	/** @deprecated Just omit the `data-lt-tabindex`-property */
	preventFocus?: boolean;
	"data-lt-tabindex"?: string;
	"data-lt-testid"?: string;
	isRTL?: boolean;
	onClick?: (event: Event) => void;
	onMouseOver?: (event: Event) => void;
	onMouseOut?: (event: Event) => void;
}

const LtCompIcon = elementFactory("comp-icon");

const APPEARANCE_VALUES = ["light", "dark"] as const;

type Appearance = (typeof APPEARANCE_VALUES)[number];

const isAppearance = (v: any): v is Appearance => APPEARANCE_VALUES.includes(String(v) as Appearance | any);

const getAppearance = (element: HTMLElement): Appearance => {
	const attr = "data-lt-force-appearance";
	const parent = element.closest(`[${attr}]`);
	const appearance = parent?.getAttribute(attr);

	if (!isAppearance(appearance)) {
		throw new Error(
			`Failed to retrieve appearance for element <${element.tagName.toLowerCase()} class="${
				element.className
			}" />`
		);
	}

	return appearance;
};

const createPortalElement = (doc: Document, appearance: Appearance) => {
	const portal = createContainerElement(doc, "lt-portal");
	portal.style.display = "none";
	portal.setAttribute("data-lt-adjust-appearance", "true");
	portal.setAttribute("data-lt-force-appearance", appearance);
	return portal;
};

const getTooltipPosition = (position: IconTooltip["position"], isRTL?: boolean): IconTooltip["position"] => {
	if (isRTL !== true) {
		return position;
	}

	switch (position) {
		case "left-bottom":
			return "right-bottom";
		case "bottom-left":
			return "bottom-right";
		case "left-top":
			return "right-top";
		case "top-left":
			return "top-right";
		case "right-bottom":
			return "left-bottom";
		case "bottom-right":
			return "bottom-left";
		case "right-top":
			return "left-top";
		case "top-right":
			return "top-left";
		case "left-center":
			return "right-center";
		case "right-center":
			return "left-center";
		default:
			return position;
	}
};

const ensureTooltipIsInViewport = (tooltip: HTMLElement, reference: HTMLElement) => {
	const referenceRect = reference.getBoundingClientRect();
	const tooltipRect = tooltip.getBoundingClientRect().toJSON();
	const { innerWidth, innerHeight } = reference.ownerDocument.defaultView!;

	const OFFSET = 8; // keep distance to the window border

	if (tooltipRect.left < 0) {
		const updatedTooltipRect = {
			...tooltipRect,
			left: OFFSET,
			right: tooltipRect.right + Math.abs(tooltipRect.left) + OFFSET,
		};

		if (isRectsIntersect(referenceRect, updatedTooltipRect)) {
			tooltip.style.setProperty("left", `${referenceRect.width + OFFSET}px`, "important");
			tooltip.style.setProperty("right", "unset", "important");
		} else {
			tooltip.style.setProperty("right", `${tooltipRect.left - OFFSET}px`, "important");
		}
	}

	if (tooltipRect.right > innerWidth) {
		const updatedTooltipRect = {
			...tooltipRect,
			left: tooltipRect.left - tooltipRect.right + innerWidth - OFFSET,
			right: innerWidth - OFFSET,
		};

		if (isRectsIntersect(referenceRect, updatedTooltipRect)) {
			tooltip.style.setProperty("right", `${referenceRect.width + OFFSET}px`, "important");
			tooltip.style.setProperty("left", "unset", "important");
		} else {
			tooltip.style.setProperty("left", `${innerWidth - tooltipRect.right - OFFSET}px`, "important");
		}
	}

	if (tooltipRect.top < 0) {
		const updatedTooltipRect = {
			...tooltipRect,
			top: OFFSET,
			bottom: tooltipRect.bottom + Math.abs(tooltipRect.top) + OFFSET,
		};

		if (isRectsIntersect(referenceRect, updatedTooltipRect)) {
			tooltip.style.setProperty("top", `${referenceRect.height + tooltipRect.height + OFFSET}px`, "important");
			tooltip.style.setProperty("bottom", "unset", "important");
		} else {
			tooltip.style.setProperty("bottom", `${tooltipRect.top - OFFSET}px`, "important");
		}
	}

	if (tooltipRect.bottom > innerHeight) {
		const updatedTooltipRect = {
			...tooltipRect,
			top: tooltipRect.top - tooltipRect.bottom + innerHeight - OFFSET,
			bottom: innerHeight - OFFSET,
		};

		if (isRectsIntersect(referenceRect, updatedTooltipRect)) {
			tooltip.style.setProperty("bottom", `${referenceRect.height + tooltipRect.height + OFFSET}px`, "important");
			tooltip.style.setProperty("top", "unset", "important");
		} else {
			tooltip.style.setProperty("top", `${innerHeight - tooltipRect.bottom - OFFSET}px`, "important");
		}
	}
};

const Icon: React.FC<Props> = ({
	"data-lt-tabindex": tabIndex,
	"data-lt-testid": testId,
	tooltipInPortal,
	...props
}) => {
	const icon = useRef<HTMLElement>(null);
	const tooltip = useRef<HTMLElement>(null);
	const tooltipClone = useRef<HTMLElement | null>(null);
	const portal = useRef<HTMLElement | null>(null);
	const domMeasurement = useRef<DomMeasurement | null>(null);
	const tooltipDelayTimeout = useRef<number | null>(null);
	const [showTooltip, setShowTooltip] = useState(false);
	const [showTooltipInPortal, setShowTooltipInPortal] = useState(false);
	const handleMouseOver = (event: Event) => {
		props.onMouseOver?.(event);

		tooltipDelayTimeout.current = self.setTimeout(() => {
			if (props.tooltip) {
				setShowTooltip(true);
			}

			if (tooltipInPortal) {
				setShowTooltipInPortal(true);
			}
		}, 200);
	};
	const handleMouseOut = (event: Event) => {
		props.onMouseOut?.(event);

		if (props.tooltip) {
			setShowTooltip(false);
		}

		if (tooltipInPortal) {
			setShowTooltipInPortal(false);
		}

		if (tooltipDelayTimeout.current) {
			clearTimeout(tooltipDelayTimeout.current);
			tooltipDelayTimeout.current = null;
		}
	};
	const handleClick = useStopPropagation((e) => props.onClick?.(e));

	useEffect(() => {
		if (showTooltip === true && tooltip.current && icon.current) {
			ensureTooltipIsInViewport(tooltip.current, icon.current);
		}
	}, [showTooltip]);

	useEffect(() => {
		if (showTooltipInPortal === true && tooltip.current && !portal.current) {
			const doc = tooltip.current.ownerDocument;
			const appearance = getAppearance(tooltip.current);
			domMeasurement.current = domMeasurement.current || new DomMeasurement(doc);
			const { left, top } = tooltip.current.getBoundingClientRect();
			const { animation } = domMeasurement.current.getComputedStyle(tooltip.current);

			if (!tooltipClone.current) {
				tooltipClone.current = tooltip.current.cloneNode(true) as HTMLElement;
				domMeasurement.current.setStyles(tooltip.current, { visibility: "hidden" }, true);
			}

			portal.current = createPortalElement(doc, appearance);

			domMeasurement.current.setStyles(
				portal.current,
				{
					position: "fixed",
					left: `${left}px`,
					top: `${top}px`,
					"z-index": "2147483647",
				},
				true
			);
			domMeasurement.current.setStyles(tooltipClone.current, { animation }, true);
			portal.current.appendChild(tooltipClone.current);
			document.body.appendChild(portal.current);
		}

		if (showTooltipInPortal === false && portal.current) {
			portal.current.remove();
			portal.current = null;
		}

		return () => {
			portal.current?.remove();
		};
	}, [showTooltipInPortal, tooltip, tooltipClone, portal, domMeasurement]);

	return (
		<LtCompIcon
			onClick={isFunction(props.onClick) ? handleClick : undefined}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			ref={icon}
			className={classes(
				`lt-icon--${props.name}`,
				props.compact && "lt-icon--compact",
				props.className,
				typeof props.onClick === "function" && "lt-icon--clickable"
			)}
			data-lt-prevent-focus={props.preventFocus}
			data-lt-tabindex={tabIndex}
			data-lt-testid={testId}
		>
			<Span className={classes("lt-icon__icon", `lt-icon__${props.name}`)} />
			{showTooltip && props.tooltip && (
				<Div
					className={classes(
						"lt-icon__tooltip",
						`lt-icon__tooltip--${getTooltipPosition(props.tooltip.position, props.isRTL)}`,
						`lt-icon__tooltip--${props.name}`
					)}
					ref={tooltip}
				>
					{props.tooltip.label}
				</Div>
			)}
			{props.label && <Span className="lt-icon__label">{props.label}</Span>}
		</LtCompIcon>
	);
};

export default Icon;
