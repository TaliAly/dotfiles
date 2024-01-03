import type * as React from "react";
import { useMemo, Fragment } from "react";
import { classes } from "../../../common/utils";
import { createDiff, Diff, type DiffComponent } from "../../../content/Diff";
import { elementFactory, Span, Div } from "../../index";

interface Props {
	from: string;
	to: string;
	className?: string;
	isSentenceSplitting?: boolean;
}

const LtCompDiff = elementFactory("comp-diff");

const getClassModifier = (part: DiffComponent) => {
	switch (true) {
		case part.removed === true:
			return "lt-comp-diff__item--removed";
		case part.added === true:
			return "lt-comp-diff__item--added";
		default:
			return;
	}
};

const getKey = (part: DiffComponent, i: number) =>
	[
		part.value,
		part.added === true && "added",
		part.removed === true && "removed",
		!part.added && !part.removed && "static",
		i,
	]
		.filter(Boolean)
		.join("-");

const DiffComponent: React.FC<Props> = ({ from, to, className, isSentenceSplitting }) => {
	const diff = useMemo<DiffComponent[]>(() => Diff.simplifyReplacements(createDiff(from, to)), [from, to]);
	const indexOfFirstDot = useMemo(() => {
		return diff.findIndex((part) => part.value === ".");
	}, [diff]);

	if (Diff.isRewrite(diff) && !isSentenceSplitting) {
		return <LtCompDiff>{Diff.toNewString(diff)}</LtCompDiff>;
	}

	return (
		<LtCompDiff className={className}>
			{diff.map((part, i) => {
				if (!part.value) {
					return null;
				}

				return (
					<Fragment key={getKey(part, i)}>
						<Span className={classes("lt-comp-diff__item", getClassModifier(part))}>{part.value}</Span>
						{isSentenceSplitting && i === indexOfFirstDot && <Div className="lt-comp-diff__item-divider" />}
					</Fragment>
				);
			})}
		</LtCompDiff>
	);
};

export default DiffComponent;
