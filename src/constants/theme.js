import _ from "lodash";

// Parse bootstrap provided styles for the :root which provides all the colors
// This allows us access to: blue, cyan, danger, dark, gray, green, indigo, info, light, orange, pink, primary, purple, red, secondary, success, teal, warning, white, yellow
// For specific values see _variables.scss in node_modules/bootswatch/dist/<theme name>
const bootstrapStyleSheet = _.find(document.styleSheets, sheet => /bootstrap/.test(sheet.href));
const rootCssRule = _.find(bootstrapStyleSheet.cssRules, { selectorText: ":root" });
const rootCssAttributes = rootCssRule.cssText.match(/(\w+):(#\w+)/g);
const colors = _.reduce(
	rootCssAttributes,
	(obj, attributeString) => {
		const match = /(\w+):(#\w+)/.exec(attributeString);
		obj[match[1]] = match[2];
		return obj;
	},
	{}
);

const overrides = {
	cerulean: {},
	cosmo: {},
	cyborg: {
		chatButtonBackground: colors.dark
	},
	darkly: {
		top: 70,
		chatButtonBackground: colors.dark
	},
	flatly: {
		top: 70
	},
	journal: {},
	litera: {
		inputBox: 85
	},
	lumen: {},
	lux: {
		top: 85,
		inputBox: 95
	},
	materia: {
		top: 80,
		inputBox: 100
	},
	minty: {},
	pulse: {
		top: 75,
		inputBox: 70
	},
	sandstone: {},
	simplex: {
		top: 65
	},
	sketchy: {
		inputBox: 80
	},
	slate: {
		chatButtonBackground: colors.dark,
		inputBox: 95
	},
	solar: {
		chatButtonBackground: colors.dark
	},
	spacelab: {},
	superhero: {
		chatButtonBackground: colors.dark
	},
	united: {},
	yeti: {}
};

export default _.assign(
	{
		top: 55,
		inputBox: 75,
		memberList: 250,
		messageAuthorBackground: colors.dark,
		messageAuthorText: colors.white,
		chatButtonBackground: colors.white
	},
	overrides[window.theme]
);
