import type * as React from "react";
import { useRef, useState, useEffect } from "react";
import { classes, isScrollable } from "../../../common/utils";
import { Div, elementFactory } from "../../index";

interface Props {
	scrollerClassName?: string;
}

const LTCompScrollableArea = elementFactory("comp-scrollable-area");

const isCurrentlyScrollable = (element: HTMLElement) => {
	return element.clientHeight < element.scrollHeight && isScrollable(element);
};

const ScrollableArea: React.FC<React.PropsWithChildren<Props>> = ({ scrollerClassName, children }) => {
	const area = useRef<HTMLElement>(null);
	const [isElementScrollable, setIsElementScrollable] = useState(false);
	const [hasElementNonZeroScrollTop, setHasElementNonZeroScrollTop] = useState(false);
	const [isElementScrolledToBottom, setIsElementScrolledToBottom] = useState(false);

	useEffect(() => {
		const element = area.current;
		const handleScroll = () => {
			setHasElementNonZeroScrollTop(element !== null && element.scrollTop > 0);
			setIsElementScrolledToBottom(
				element !== null && element.scrollTop + element.offsetHeight === element.scrollHeight
			);
		};

		if (element) {
			element.addEventListener("scroll", handleScroll);
		}

		return () => {
			if (element) {
				element.removeEventListener("scroll", handleScroll);
			}
		};
	}, [area]);

	useEffect(() => {
		const element = area.current;
		let observer: ResizeObserver | undefined;

		if (element) {
			observer = new ResizeObserver(() => {
				setIsElementScrollable(isCurrentlyScrollable(element));
			});
			observer.observe(element);
		}

		return () => {
			if (element) {
				observer?.unobserve(element);
			}
		};
	}, [area]);

	return (
		<LTCompScrollableArea className="lt-comp-scrollable-area">
			{hasElementNonZeroScrollTop && (
				<Div className="lt-comp-scrollable-area__shadow lt-comp-scrollable-area__shadow--top" />
			)}
			<Div className={classes("lt-comp-scrollable-area__scroller", scrollerClassName)} ref={area}>
				{children}
			</Div>
			{isElementScrollable && isElementScrolledToBottom === false && (
				<Div className="lt-comp-scrollable-area__shadow lt-comp-scrollable-area__shadow--bottom" />
			)}
		</LTCompScrollableArea>
	);
};

export default ScrollableArea;
