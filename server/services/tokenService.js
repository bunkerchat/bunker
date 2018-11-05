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

/*
	How rules work, in the following order
	1. Longest match wins
	2. Assuming a tie, order in which rules are added wins
 */
tokenService.tokenize = text => {
	// lexer.setSource(text);
	// lexer.lex();

	const output = [];
	const lexerInstance = new Lexer();

	// ** code
	lexerInstance.addState("code");

	// start by finding a ` that is followed by anything and another `
	lexerInstance.addRule(/`(?=.+`)/, lexer => {
		lexer.begin("code");
	});

	// put everything into this state called code
	lexerInstance.addStateRule("code", /.+`/, lexer => {
		// remove any  backticks in code for now
		const text = lexer.text.replace("`", "");
		output.push({ type: "code", text });
	});

	// turn off by finding code using a ` that has ` and code behind it
	lexerInstance.addStateRule("code", /(?<=`.+)/, lexer => {
		lexer.begin(Lexer.STATE_INITIAL);
	});

	// word
	lexerInstance.addRule(/\w*\s*/, lexer => {
		output.push({ type: "word", text: lexer.text });
	});

	// catch all
	lexerInstance.addRule(/./, lexer => {
		output.push({ type: "unknown", text: lexer.text });
	});

	lexerInstance.setSource(text);
	lexerInstance.lex();

	return output;
};
