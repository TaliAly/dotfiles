import type * as React from "react";
import { classes } from "../../../common/utils";
import { Div, elementFactory } from "../../index";

interface Props {
	type?: "happy" | "sad" | "error";
	caption: string;
	html?: string;
	text?: string;
}

const LTCompMascotSays = elementFactory("comp-mascot-says");

const MascotSays: React.FC<Props> = ({ type, caption, html, text }) => {
	if (Boolean(html) && Boolean(text)) {
		console.warn("<MascotSays /> Got `html` and `text`; will display `html`");
	}

	return (
		<LTCompMascotSays>
			<Div
				className={classes(
					"lt-comp-mascot-says__image",
					type === "happy" && "lt-comp-mascot-says__image--happy",
					type === "sad" && "lt-comp-mascot-says__image--sad",
					type === "error" && "lt-comp-mascot-says__image--error"
				)}
			/>
			<Div className="lt-comp-mascot-says__caption">{caption}</Div>
			{html && <Div className="lt-comp-mascot-says__text" dangerouslySetInnerHTML={{ __html: html }} />}
			{!html && text && <Div className="lt-comp-mascot-says__text">{text}</Div>}
		</LTCompMascotSays>
	);
};

export default MascotSays;
