import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { hasAnyUnreadMention, getTotalUnreadMessageCount, getIsDisconnected } from "../../selectors/selectors";
import HeaderRoomLink from "./HeaderRoomLink.jsx";
import UnreadMessageBadge from "./UnreadMessageBadge.jsx";
import UploadButton from "../imageUpload/UploadButton.jsx";
import { getRoomIds } from "../../selectors/selectors.js";

const Header = ({ roomIds, totalUnreadMessageCount, anyUnreadMention, isDisconnected }) => {
	return (
		<div>
			<nav className="navbar navbar-expand fixed-top navbar-dark bg-dark">
				<Link className="navbar-brand" to="/2/lobby">
					Bunker{" "}
					{totalUnreadMessageCount > 0 && (
						<UnreadMessageBadge className={`badge badge-primary d-md-none ${anyUnreadMention ? "mention" : ""}`}>
							{totalUnreadMessageCount}
						</UnreadMessageBadge>
					)}
				</Link>
				<ul className="navbar-nav d-none d-md-flex">
					{_.map(roomIds, id => (
						<HeaderRoomLink key={id} roomId={id} />
					))}
				</ul>
				<div className="ml-auto navbar-nav text-right">
					<UploadButton />
					<Link className="nav-item nav-link" to={`/2/settings`}>
						<FontAwesomeIcon icon="cog" spin={isDisconnected} />
					</Link>
				</div>
			</nav>
		</div>
	);
};

const mapStateToProps = state => ({
	roomIds: getRoomIds(state),
	totalUnreadMessageCount: getTotalUnreadMessageCount(state),
	anyUnreadMention: hasAnyUnreadMention(state),
	isDisconnected: getIsDisconnected(state)
});

export default connect(mapStateToProps)(Header);
