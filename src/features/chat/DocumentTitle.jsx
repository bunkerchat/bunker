import React, { useEffect } from "react";
import { connect } from "react-redux";
import { getDocumentTitle } from "./chatSelectors.js";

const mapStateToProps = state => ({
	title: getDocumentTitle(state)
});

function DocumentTitle(props) {
	useEffect(
		() => {
			document.title = props.title;
		},
		[props.title]
	);

	return null;
}

export default connect(mapStateToProps)(DocumentTitle);
