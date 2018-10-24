import _ from "lodash";
import tinycolor from "tinycolor2";

// Parse bootstrap provided styles for the :root which provides all the colors
// This allows us access to: blue, cyan, danger, dark, gray, green, indigo, info, light, orange, pink, primary, purple, red, secondary, success, teal, warning, white, yellow
// For specific values see _variables.scss in node_modules/bootswatch/dist/<theme name>
const bootstrapStyleSheet = _.find(document.styleSheets, sheet => /bootstrap/.test(sheet.href));
const rootCssRule = _.find(bootstrapStyleSheet.cssRules, { selectorText: ":root" });
const rootCssAttributes = rootCssRule.cssText.match(/([a-z\-]+):(#\w+)/g);
const colors = _.reduce(
	rootCssAttributes,
	(obj, attributeString) => {
		const match = /([a-z][\w\-]+):(#\w+)/.exec(attributeString);
		obj[match[1]] = match[2];
		return obj;
	},
	{}
);

console.log("theme colors are:", colors);

const overrides = {
	cerulean: {},
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
		mentionBackgroundColor: colors.warning,
		mentionForegroundColor: colors.white,
		mentionHeaderForegroundColor: colors.white,
		spoilerHoverForegroundColor: colors.secondary
	},
	spacelab: {},
	superhero: {
		top: 48,
		chatButtonBackground: colors.dark,
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
		messageAuthorText: colors.white,
		chatButtonBackground: colors.white,
		mentionBackgroundColor: "#faf2cc",
		mentionForegroundColor: "inherit",
		mentionHeaderForegroundColor: colors.dark,
		messageControlsBackground: colors.white
	},
	overrides[window.theme]
);
