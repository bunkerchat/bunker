import React, { useEffect } from "react";
import { imageEmoticonsFiles } from "../../constants/emoticons.js";

const EmoticonPreLoad = () => {
	useEffect(() => {
		setTimeout(() => {
			imageEmoticonsFiles.forEach(image => {
				new Image().src = `/assets/images/emoticons/${image}`;
			});
		}, 8000);
	}, []);

	return null;
};

export default EmoticonPreLoad;
