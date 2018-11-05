const tokenService = module.exports;
const Lexer = require("flex-js");
// const lexer = new Lexer();

// // options
// // lexer.setIgnoreCase(true);
// //
// // // definitions
// // lexer.addDefinition("DIGIT", /[0-9]/);
// //
// // // rules
// // lexer.addRule(/{DIGIT}+\.{DIGIT}+/, function(lexer) {
// // 	console.log("Found float: " + lexer.text);
// // });
// // lexer.addRule(/\s+/);

// lexer.setSource('abcd');
// lexer.lex();

tokenService.tokenize = text => {
	// lexer.setSource(text);
	// lexer.lex();

	const output = [];
	const lexer = new Lexer();

	// word
	lexer.addRule(/\w+/, lexer => {
		output.push({ type: "word", text: lexer.text });
	});

	// white space
	lexer.addRule(/\s+/, lexer => {
		output.push({ type: "space", text: lexer.text });
	});

	// catch all
	lexer.addRule(/./, lexer => {
		output.push({ type: "unknown", text: lexer.text });
	});

	lexer.setSource(text);
	lexer.lex();

	return output;
};
