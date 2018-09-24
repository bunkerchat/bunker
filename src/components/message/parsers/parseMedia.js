import {replaceAll} from './util';

const youtubeRegexp = () => /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;

const parseMedia = text => {
	const replacedLinks = {};

	// do no media on mobile
	// const onMobile = _.includes(['Android', 'iPhone'], navigator.appVersion);

	const linkMeta = {}; //scope.bunkerMessage.linkMeta || {};

	// Parse links
	const links = [...text.match(/https?:\/\/\S+/gi)];

	_.each(links, function (link) {
		// remove query string noise from visible link
		let linkWithoutQueryString = link.split("?")[0];

		// much complaining about "broken" youtube links, even though they obviously worked fucking fine, idiots
		if (youtubeRegexp().test(link)) {
			linkWithoutQueryString = link
		}

		if (!replacedLinks[link]) {
			const target = _.includes(link, window.location.origin) ? '_self' : '_blank';
			text = replaceAll(text, link, `<a href="${link}" target="${target}">${linkWithoutQueryString}</a>`);
			replacedLinks[link] = true;
		}
	});

	return text;
};

export default parseMedia;
