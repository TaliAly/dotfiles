import type * as React from "react";
import { useState, useEffect } from "react";
import { classes } from "../../../common/utils";
import { pad } from "../../../core/utils";
import { Span, elementFactory } from "../../index";

interface Props {
	expires: number;
	digitClass?: string;
	dividerClass?: string;
	onExpired?: () => void;
}

interface Time {
	seconds: number;
	minutes: number;
	hours: number;
}

const LtCompCountdown = elementFactory("comp-countdown");

const intToTime = (int: number): Time => {
	const seconds = Math.floor((int / 1000) % 60);
	const minutes = Math.floor((int / 1000 / 60) % 60);
	const hours = Math.floor(int / 1000 / 60 / 60);

	return { seconds, minutes, hours };
};

const now = (expires: number) => Math.max(0, expires - Date.now());

const useInterval = (expires: number, onExpired?: () => void): Time => {
	const [diff, setDiff] = useState(now(expires));

	useEffect(() => {
		let interval: number | null = self.setInterval(() => {
			const newDiff = now(expires);

			setDiff(newDiff);

			if (newDiff === 0 && typeof interval === "number") {
				self.clearInterval(interval);
				interval = null;
				onExpired?.();
			}
		}, 1_000);

		return () => {
			if (typeof interval === "number") {
				self.clearInterval(interval);
			}
		};
	}, [expires, onExpired]);

	return intToTime(diff);
};

const Countdown: React.FC<Props> = ({ expires, digitClass, dividerClass, onExpired }) => {
	const { seconds, minutes, hours } = useInterval(expires, onExpired);

	return (
		<LtCompCountdown>
			<Span className={classes("lt-comp-countdown__digit", digitClass)}>{pad(hours)}</Span>
			<Span className={classes("lt-comp-countdown__divider", dividerClass)}>:</Span>
			<Span className={classes("lt-comp-countdown__digit", digitClass)}>{pad(minutes)}</Span>
			<Span className={classes("lt-comp-countdown__divider", dividerClass)}>:</Span>
			<Span className={classes("lt-comp-countdown__digit", digitClass)}>{pad(seconds)}</Span>
		</LtCompCountdown>
	);
};

export default Countdown;
