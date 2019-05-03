// thoughts copied from https://github.com/charliewilco/react-gluejar/blob/master/src/index.tsx
import { useEffect, useState } from "react";
import { isImageFile } from "./imageLoader.js";

export const useImagePasteWatcher = () => {
	const [images, setImages] = useState([]);

	useEffect(() => {
		const pasteHandler = e => {
			const { clipboardData } = e;
			if (!clipboardData || !clipboardData.items.length) return;

			const newImages = [];
			for (let item of clipboardData.items) {
				if (!isImageFile(item.type)) continue;

				const file = item.getAsFile();
				newImages.push(file);
			}

			setImages(newImages);
		};

		window.addEventListener("paste", pasteHandler);
		return () => window.removeEventListener("paste", pasteHandler);
	});

	return images;
};
