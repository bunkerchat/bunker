var warmup = {
	done: false
};

setTimeout(function () {
	warmup.done = true;
}, 18000); // 3 minutes of warmup time

module.exports = warmup;
