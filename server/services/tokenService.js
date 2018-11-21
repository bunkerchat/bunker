const tokenService = module.exports;
const Lexer = require("flex-js");
const emojiRegex = require("emoji-regex");
const encode = require("ent").encode;
const emoticonService = require("./emoticonService.js");

let emoticonHash = {};
emoticonService.getEmoticonNamesFromDisk().then(_emoticons => {
	_emoticons.forEach(emoticon => {
		// remove extensions
		const key = emoticon.replace(/\..*$/gi, "");
		emoticonHash[key] = emoticon;
	});
});

// chop off leading and trailing characters
const chopEnds = text => text.slice(1, text.length - 1);

/*
	How rules work, in the following order
	1. Longest match wins
	2. Assuming a tie, order in which rules are added wins
 */
tokenService.tokenize = textToTokenize => {
	let output = [];

	if (!textToTokenize) {
		return output;
	}

	const lexerInstance = new Lexer();

	lexerInstance.setIgnoreCase(true);

	lexerInstance.addDefinition("ALPHA_NUM", /[a-z0-9]/);
	lexerInstance.addDefinition("ALPHA_NUM_CHAR", /[a-z0-9,.'"!@#$%^&()\-+=]/);
	lexerInstance.addDefinition("ALPHA_NUM_CHAR_SPACE", /[a-z0-9,.'"!@#$%^&()\-+=\s]/);


	// contains at least one line break
	lexerInstance.addRule(/.*([\r\n])+.*/, lexer => {
		output.push({ type: "quote", value: encode(textToTokenize) });
		lexer.terminate();
	});

	// ** code
	lexerInstance.addRule(/`.+`/, lexer => {
		output.push({ type: "code", value: encode(chopEnds(lexer.text)) });
	});

	// ** urls
	lexerInstance.addRule(/https?:\/\/\S+/, lexer => {
		output.push({ type: "url", value: encode(lexer.text) });
	});

	// ** italics
	lexerInstance.addRule(/_{ALPHA_NUM_CHAR_SPACE}+?_/, lexer => {
		output.push({ type: "italics", value: encode(chopEnds(lexer.text)) });
	});

	// ** bold
	lexerInstance.addRule(/\*{ALPHA_NUM_CHAR_SPACE}+?\*/, lexer => {
		output.push({ type: "bold", value: encode(chopEnds(lexer.text)) });
	});

	// ** spoiler
	lexerInstance.addRule(/\|{ALPHA_NUM_CHAR_SPACE}+?\|/, lexer => {
		output.push({ type: "spoiler", value: encode(chopEnds(lexer.text)) });
	});

	// ** strikethrough
	lexerInstance.addRule(/~{ALPHA_NUM_CHAR_SPACE}+?~/, lexer => {
		output.push({ type: "strikethrough", value: encode(chopEnds(lexer.text)) });
	});

	// ** emoticons
	lexerInstance.addRule(/:{ALPHA_NUM}+:/, lexer => {
		const emoticon = chopEnds(lexer.text);
		const isRealEmoticon = !!emoticonHash[emoticon];
		if (isRealEmoticon) {
			output.push({ type: "emoticon", value: encode(emoticon) });
		} else {
			output.push({ type: "word", value: encode(lexer.text) });
		}
	});

	// ** words and letters
	lexerInstance.addRule(/{ALPHA_NUM_CHAR}*\s*/, lexer => {
		output.push({ type: "word", value: encode(lexer.text) });
	});

	// making new regex to strip off the global flag /g
	lexerInstance.addRule(new RegExp(emojiRegex().source), lexer => {
		output.push({ type: "emoji", value: encode(lexer.text) });
	});

	// ** catch all
	lexerInstance.addRule(/./, lexer => {
		output.push({ type: "unknown", value: encode(lexer.text) });
	});

	lexerInstance.setSource(textToTokenize);

	try {
		lexerInstance.lex();
	} catch (e) {
		console.error("tokenService error", e);
		output = [{ type: "unknown", value: encode(textToTokenize) }];
	}

	return output;
};
