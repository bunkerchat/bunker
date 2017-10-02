// Ensure we're in the project directory, so relative paths work as expected
process.chdir(__dirname);

require('./server/server').run(function (err) {
	if(err) process.exit(10);
});