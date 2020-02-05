export const userTiming = () => next => action => {
	if (performance.mark === undefined) return next(action);
	performance.mark(`${action.type}_start`);
	const result = next(action);
	performance.mark(`${action.type}_end`);
	performance.measure(`${action.type}`, `${action.type}_start`, `${action.type}_end`);

	const entries = performance.getEntriesByType("measure");
	const duration = entries[0]?.duration;

	if (duration > 30) {
		console.log(`-SLOW ACTION- ${action.type}`, { action, duration });
	} else {

	}

	performance.clearMarks();
	performance.clearMeasures();

	return result;
};
