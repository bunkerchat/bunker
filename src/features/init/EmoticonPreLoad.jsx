import React, { useEffect } from "react";
import emoticons from "../../constants/emoticons.js";
import _ from "lodash";

const EmoticonPreLoad = () => {
	useEffect(() => {
		setTimeout(() => {
			const images = _.map(emoticons.imageEmoticons, "file");
			images.forEach(image => {
				new Image().src = `/assets/images/emoticons/${image}`;
			});
		}, 8000);
	}, []);

	return null;
};

export default EmoticonPreLoad;
