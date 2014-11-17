var warmup = {
	done: false
};

setTimeout(function () {
	warmup.done = true;
},180000); // 3 minutes of warmup time

module.exports = warmup;
