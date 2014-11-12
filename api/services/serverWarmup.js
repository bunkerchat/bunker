var warmup = {
	done: false
};

setTimeout(function () {
	warmup.done = true;
},30000); // 30 seconds of warmup time

module.exports = warmup;
