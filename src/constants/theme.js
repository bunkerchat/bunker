import _ from "lodash";

const overrides = {
	cerulean: {},
	cosmo: {},
	cyborg: {},
	darkly: {
		top: 70
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
	materia: {},
	minty: {},
	pulse: {
		top: 75,
		inputBox: 70
	},
	sandstone: {},
	simplex: {
		top: 65
	},
	sketchy: {},
	slate: {},
	solar: {},
	spacelab: {},
	superhero: {},
	united: {},
	yeti: {}
};

export default _.assign(
	{
		top: 55,
		inputBox: 75,
		memberList: 250
	},
	overrides[window.theme]
);
