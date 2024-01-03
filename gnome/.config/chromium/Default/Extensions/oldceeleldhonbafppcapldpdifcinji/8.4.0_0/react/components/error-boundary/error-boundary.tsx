import type * as React from "react";
import { Component } from "react";
import { Tracker } from "../../../common/tracker";

interface State {
	hasError: boolean;
}

class ErrorBoundary extends Component<React.PropsWithChildren, State> {
	state = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	componentDidCatch(error: any, errorInfo: any) {
		const [, componentName = "<unknown>"] = String(errorInfo?.componentStack).match(/^[^at]+at\s+([^\s]+)/) || [];

		Tracker.trackError("js", "react_error_boundary", `[${componentName}] ${error.message}`);
	}

	render() {
		if (this.state.hasError) {
			return null;
		}
		return this.props.children;
	}
}

export default ErrorBoundary;
