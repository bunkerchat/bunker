import { useEffect, useMemo } from "react";
import _ from "lodash";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { getTextForCurrentRoom } from "../../selectors/selectors.js";
import { sendTypingNotification } from "./roomsSlice";

function BroadcastTypingEvents({ text = "", sendTypingNotification }) {
	const notify = useMemo(() => _.throttle(sendTypingNotification, 1500, { trailing: false }), []);

	useEffect(
		() => {
			if (text.length) notify();
		},
		[text]
	);
	return null;
}

const mapStateToProps = createStructuredSelector({
	text: getTextForCurrentRoom
});

const mapDispatchToProps = {
	sendTypingNotification
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(BroadcastTypingEvents);
