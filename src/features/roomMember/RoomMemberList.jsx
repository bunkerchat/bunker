import React from "react";
import { connect } from "react-redux";
import { useDebounce } from "use-debounce";
import theme from "../../constants/theme";
import styled from "styled-components";
import RoomMemberListItem from "./RoomMemberListItem.jsx";
import { getSortedRoomMemberUserIds } from "../../selectors/selectors.js";

const MemberListContainer = styled.div`
	flex: 0 0 ${theme.memberList}px;
	height: calc(100vh - ${theme.top}px);
	overflow-x: hidden;
	overflow-y: auto;
`;

function RoomMemberList({ sortedRoomMemberUserIds }) {
	const [debouncedSortedRoomMemberUserIds] = useDebounce(sortedRoomMemberUserIds, 75, { maxWait: 500 });

	return (
		<MemberListContainer className="border-left d-none d-md-block">
			<ul className="list-group list-group-flush">
				{debouncedSortedRoomMemberUserIds.map(id => (
					<RoomMemberListItem key={id} userId={id} />
				))}
			</ul>
		</MemberListContainer>
	);
}

RoomMemberList.defaultProps = {
	sortedRoomMemberUserIds: []
};

const mapStateToProps = state => ({
	sortedRoomMemberUserIds: getSortedRoomMemberUserIds(state)
});

export default connect(mapStateToProps)(RoomMemberList);
