import _ from "lodash";
import tinycolor from "tinycolor2";

let colors = {};

// Some checks here which allow this file to be loaded during tests
// There will be no colors in a non-browser environment
if (document && document.styleSheets) {
	// Parse bootstrap provided styles for the :root which provides all the colors
	// This allows us access to: blue, cyan, danger, dark, gray, green, indigo, info, light, orange, pink, primary, purple, red, secondary, success, teal, warning, white, yellow
	// For specific values see _variables.scss in node_modules/bootswatch/dist/<theme name>
	const bootstrapStyleSheet = _.find(document.styleSheets, sheet => /bundled/.test(sheet.href));
	if (bootstrapStyleSheet) {
		const rootCssRule = _.find(bootstrapStyleSheet.cssRules, { selectorText: ":root" });
		const rootCssAttributes = rootCssRule.cssText.match(/([a-z\-]+):\s*(#\w+)/g);
		colors = _.reduce(
			rootCssAttributes,
			(obj, attributeString) => {
				const match = /([a-z][\w\-]+):\s*(#\w+)/.exec(attributeString);
				obj[match[1]] = match[2];
				return obj;
			},
			{}
		);
	}
}

// console.log("theme colors are:", colors);

const overrides = {
	cerulean: {},
	classic: {
		top: 37
	},
	cosmo: {
		inputBox: 36
	},
	journal: {},
	sandstone: {
		top: 53,
		inputBox: 35
	},
	simplex: {
		top: 65,
		inputBox: 33
	},
	sketchy: {
		inputBox: 40
	},
	solar: {
		chatButtonBackground: colors.dark,
		messageAuthorCaret: colors.dark,
		mentionBackgroundColor: colors.warning,
		mentionForegroundColor: colors.white,
		mentionHeaderForegroundColor: colors.white,
		spoilerHoverForegroundColor: colors.secondary
	},
	spacelab: {},
	superhero: {
		top: 48,
		chatButtonBackground: colors.dark,
		messageAuthorCaret: "#2B3E50",
		mentionBackgroundColor: colors.info,
		mentionForegroundColor: colors.white,
		mentionHeaderForegroundColor: colors.white,
		spoilerHoverForegroundColor: "#ebebeb"
	}
};

export default _.assign(
	{
		top: 55,
		inputBox: 38,
		memberList: 250,
		messageAuthorBackground: colors.dark,
		messageLocalAuthorBackground: tinycolor(colors.dark)
			.lighten(10)
			.toString(),
		messageAuthorCaret: colors.white,
		messageAuthorText: colors.white,
		chatButtonBackground: colors.white,
		mentionBackgroundColor: "#faf2cc",
		mentionForegroundColor: "inherit",
		mentionHeaderForegroundColor: colors.dark,
		messageControlsBackground: colors.white,
		messageHoverBackground: colors.light,
		colors
	},
	overrides[window.theme]
);
