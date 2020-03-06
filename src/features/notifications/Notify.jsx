import React, { useCallback } from "react";
import { connect } from "react-redux";
import Notification from "react-web-notification";
import {
	getLastMentionAuthorNick,
	getLastMentionRoomName,
	getLastMentionText,
	getShowNotification
} from "./notificationsSelectors.js";
import { getDesktopMentionNotifications } from "../settings/userSettingsSelectors";

function Notify({
	// state
	desktopMentionNotifications,
	lastMentionRoomName,
	lastMentionAuthorNick,
	lastMentionText,
	showNotification
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
			ignore={!showNotification}
			title={notificationTitle}
			onShow={onShow}
			onClick={onClick}
			onClose={onClose}
			onError={onError}
			options={options}
		/>
	);
}

const mapStateToProps = state => ({
	desktopMentionNotifications: getDesktopMentionNotifications(state),
	lastMentionRoomName: getLastMentionRoomName(state),
	lastMentionAuthorNick: getLastMentionAuthorNick(state),
	lastMentionText: getLastMentionText(state),
	showNotification: getShowNotification(state)
});

const mapDispatchToProps = {};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Notify);
