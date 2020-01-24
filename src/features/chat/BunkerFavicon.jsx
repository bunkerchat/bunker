import React from "react";
import { connect } from "react-redux";
import Favicon from "react-favicon";

import { hasAnyUnreadMention } from "../../selectors/selectors.js";
import { getTotalUnreadMessageCount } from "../message/messageSelectors.js";

const mapStateToProps = state => ({
	totalUnreadMessageCount: getTotalUnreadMessageCount(state),
	hasAnyUnreadMention: hasAnyUnreadMention(state)
});

const path = "/assets/images/";
const mention = path + "bunkerIcon_mention.png";
const unread = path + "bunkerIcon_unread.png";
const normal = path + "bunkerIcon.png";

function BunkerFavicon(props) {
	const url = (props.hasAnyUnreadMention && mention) || (props.totalUnreadMessageCount && unread) || normal;
	return <Favicon url={url} />;
}

export default connect(mapStateToProps)(BunkerFavicon);
