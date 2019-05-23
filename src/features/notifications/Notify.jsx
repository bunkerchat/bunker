import React, { useCallback } from "react";
import { createStructuredSelector } from "reselect";
import { connect } from "react-redux";
import Notification from "react-web-notification";
import {
	getDesktopMentionNotifications,
	getLastMentionAuthorNick,
	getLastMentionRoomName,
	getLastMentionText
} from "../../selectors/selectors.js";

function Notify({
	// state
	desktopMentionNotifications,
	lastMentionRoomName,
	lastMentionAuthorNick,
	lastMentionText
}) {
	if (!desktopMentionNotifications) return null;

	const onShow = useCallback(() => console.log("onshow"));
	const onClick = useCallback(() => console.log("onClick"));
	const onClose = useCallback(() => console.log("onClose"));
	const onError = useCallback(() => console.log("onError"));

	const options = {
		tag: Date.now(),
		body: lastMentionText
	};

	const notificationTitle = `${lastMentionAuthorNick} in "${lastMentionRoomName}"`;

	return (
		<Notification
			ignore={!lastMentionText}
			title={notificationTitle}
			onShow={onShow}
			onClick={onClick}
			onClose={onClose}
			onError={onError}
			options={options}
		/>
	);
}

const mapStateToProps = createStructuredSelector({
	desktopMentionNotifications: getDesktopMentionNotifications,
	lastMentionRoomName: getLastMentionRoomName,
	lastMentionAuthorNick: getLastMentionAuthorNick,
	lastMentionText: getLastMentionText
});

const mapDispatchToProps = {
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Notify);
