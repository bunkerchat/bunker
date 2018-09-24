import _ from "lodash";

const overrides = {
	cerulean: {
		messageBackground: '#fff'
	},
	cosmo: {},
	cyborg: {},
	darkly: {
		top: '70px'
	},
	flatly: {
		top: '70px'
	},
	journal: {},
	litera: {},
	lumen: {
		messageBackground: '#fff'
	},
	lux: {
		top: '85px'
	},
	materia: {},
	minty: {
		messageBackground: '#fff'
	},
	pulse: {
		top: '75px'
	},
	sandstone: {
		messageBackground: '#fff'
	},
	simplex: {
		top: '65px'
	},
	sketchy: {},
	slate: {},
	solar: {},
	spacelab: {
		messageBackground: '#fff'
	},
	superhero: {},
	united: {},
	yeti: {}
};

export default _.assign({
	top: '55px',
	messageBackground: 'transparent'
}, overrides[window.theme]);
