import type * as React from "react";
import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { DomMeasurement, type BoxInterface } from "../../../common/domMeasurement";
import { addUseCaptureEvent, getClosestXBox, isVisible, simulateMouseClick } from "../../../common/utils";
import { KeyboardNavigationContext } from "./context";

interface Props {
	keyboardEventTarget: Document;
	enableKeyboard: boolean;
	root: HTMLElement;
	onClose: (e: Event) => void;
}

const getEnabledElements = (elements: HTMLElement[]): HTMLElement[] =>
	elements.filter((element) => element.dataset.ltTabindex && Number(element.dataset.ltTabindex) > -1);

const getInteractiveElements = (target: HTMLElement) =>
	Array.from(target.querySelectorAll<HTMLElement>("[data-lt-tabindex]"));

const KeyboardNavigation: React.FC<React.PropsWithChildren<Props>> = ({
	keyboardEventTarget,
	enableKeyboard,
	root,
	children,
	onClose,
}) => {
	// Provide a way to force updating the list of interactive
	// elements by tying its cache to a button group hash string
	const [buttonGroupHash, setButtonGroupHash] = useState("");

	const focusedButtonIndex = useRef(0);
	const domMeasurement = useMemo(() => new DomMeasurement(keyboardEventTarget), [keyboardEventTarget]);
	const setFocusIndex = useCallback((index: number) => {
		focusedButtonIndex.current = index;
	}, []);
	const getFocusIndex = useCallback(() => focusedButtonIndex.current, []);
	const updateFocus = useCallback(() => {
		const buttons = getInteractiveElements(root);

		if (!buttons) {
			return;
		}

		for (const button of buttons) {
			button.classList.remove("lt-card__button-focused");
		}

		if (typeof focusedButtonIndex.current === "undefined" || !buttons[focusedButtonIndex.current]) {
			return;
		}

		const enabledButtons = getEnabledElements(buttons);
		const newActiveElement = enabledButtons[focusedButtonIndex.current];

		if (!newActiveElement) {
			return;
		}

		newActiveElement.classList.add("lt-card__button-focused");
		newActiveElement.scrollIntoView({ block: "nearest", inline: "nearest" });
	}, [keyboardEventTarget]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose(e as Event);
				// also prevent keyup handlers to fire
				e.target?.addEventListener("keyup", (e) => e.stopImmediatePropagation(), { once: true, capture: true });
				e.stopImmediatePropagation();
				return;
			}

			const allButtons = getInteractiveElements(root);

			if (!enableKeyboard || typeof focusedButtonIndex.current === "undefined" || !allButtons?.length) {
				return;
			}
			const buttons = getEnabledElements(allButtons);

			let key = e.key;
			if (e.key === "Tab") {
				key = e.shiftKey ? "ArrowLeft" : "ArrowRight";
			}

			switch (key) {
				case "ArrowLeft": {
					for (let i = 1; i < buttons.length; i++) {
						let index = focusedButtonIndex.current - i;
						if (index < 0) {
							index += buttons.length;
						}

						if (isVisible(buttons[index])) {
							focusedButtonIndex.current = index;
							break;
						}
					}

					updateFocus();

					e.stopImmediatePropagation();
					e.preventDefault();
					break;
				}
				case "ArrowRight": {
					for (let i = 1; i < buttons.length; i++) {
						let index = focusedButtonIndex.current + i;
						if (index >= buttons.length) {
							index -= buttons.length;
						}

						if (isVisible(buttons[index])) {
							focusedButtonIndex.current = index;
							break;
						}
					}

					updateFocus();

					e.stopImmediatePropagation();
					e.preventDefault();
					break;
				}
				case "ArrowUp": {
					const boxes = buttons.map((button) =>
						isVisible(button) ? domMeasurement.getBorderBox(button) : null
					);
					const focusedButtonBox = boxes[focusedButtonIndex.current];

					if (!focusedButtonBox) {
						return;
					}

					const boxesAbove = boxes.filter(
						(box): box is BoxInterface =>
							typeof box?.bottom === "number" && box?.bottom <= focusedButtonBox.top
					);
					const prevLineTop = Math.max(...boxesAbove.map((box) => box.top));
					const boxesOnPrevLine = boxesAbove.filter((box) => box.top === prevLineTop);
					const newFocusedBox = getClosestXBox(boxesOnPrevLine, focusedButtonBox);

					if (newFocusedBox) {
						focusedButtonIndex.current = boxes.indexOf(newFocusedBox);
					} else {
						for (let i = buttons.length - 1; i >= 0; i--) {
							if (isVisible(buttons[i])) {
								focusedButtonIndex.current = i;
								break;
							}
						}
					}

					updateFocus();

					e.stopImmediatePropagation();
					e.preventDefault();
					break;
				}
				case "ArrowDown": {
					const boxes = buttons.map((button) =>
						isVisible(button) ? domMeasurement.getBorderBox(button) : null
					);
					const focusedButtonBox = boxes[focusedButtonIndex.current];

					if (!focusedButtonBox) {
						return;
					}

					const boxesUnder = boxes.filter(
						(box): box is BoxInterface =>
							typeof box?.top === "number" && box?.top >= focusedButtonBox.bottom
					);
					const nextLineTop = Math.min(...boxesUnder.map((box) => box.top));
					const boxesOnNextLine = boxesUnder.filter((box) => box.top === nextLineTop);
					const newFocusedBox = getClosestXBox(boxesOnNextLine, focusedButtonBox);

					if (newFocusedBox) {
						focusedButtonIndex.current = boxes.indexOf(newFocusedBox);
					} else {
						for (let i = 0; i < buttons.length; i++) {
							if (isVisible(buttons[i])) {
								focusedButtonIndex.current = i;
								break;
							}
						}
					}

					updateFocus();

					e.stopImmediatePropagation();
					e.preventDefault();
					break;
				}
				case "Enter": {
					if (buttons[focusedButtonIndex.current]) {
						simulateMouseClick(buttons[focusedButtonIndex.current], { shiftKey: e.shiftKey });
						requestAnimationFrame(() => updateFocus());
					}

					e.stopImmediatePropagation();
					e.preventDefault();
					break;
				}
			}
		};

		const { destroy: unbindKeydownListener } = addUseCaptureEvent(keyboardEventTarget, "keydown", handleKeyDown);

		return () => unbindKeydownListener();
	}, [
		keyboardEventTarget,
		enableKeyboard,
		buttonGroupHash,
		focusedButtonIndex,
		domMeasurement,
		updateFocus,
		onClose,
	]);

	// Waiting for the first interactive element to be rendered
	// by React to start the party!!
	useEffect(() => {
		if (!enableKeyboard) {
			return;
		}
		const initialElements = getEnabledElements(getInteractiveElements(root));
		let observer: MutationObserver | undefined;

		if (initialElements.length) {
			updateFocus();
			return;
		}

		observer = new MutationObserver((mutationList) => {
			for (const mutation of mutationList) {
				if (mutation.type === "childList") {
					const elements = getEnabledElements(getInteractiveElements(root));

					if (elements.length) {
						observer?.disconnect();
						observer = undefined;
						updateFocus();
					}
				}
			}
		});
		observer.observe(root, { childList: true, subtree: true });

		return () => {
			observer?.disconnect();
		};
	}, [root, enableKeyboard, keyboardEventTarget, buttonGroupHash, updateFocus]);

	// Assume that there are new interactive DOM elements present
	// when the button group hash changes, so clearing the
	// DOM Measurement cache...
	useEffect(() => {
		domMeasurement.clearCache();
	}, [buttonGroupHash, domMeasurement]);

	return (
		<KeyboardNavigationContext.Provider value={{ setFocusIndex, getFocusIndex, setButtonGroupHash }}>
			{children}
		</KeyboardNavigationContext.Provider>
	);
};

export default KeyboardNavigation;
