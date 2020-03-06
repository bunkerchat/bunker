import styled from "styled-components";
import theme from "../../constants/theme";

const UnreadMessageBadge = styled.span`
	&.mention {
		background-color: ${theme.mentionBackgroundColor};
		color: ${theme.mentionHeaderForegroundColor};
	}
`;

export default UnreadMessageBadge;
