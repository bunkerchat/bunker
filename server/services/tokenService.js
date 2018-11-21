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
const chop = (first, text, last) => text.slice(first, text.length - last);

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
	lexerInstance.addDefinition("ALPHA_NUM_CHAR", /[a-z0-9,.'"!]/);
	lexerInstance.addDefinition("ALPHA_NUM_CHAR_SPACE", /[a-z0-9,.'"!\s]/);


	// contains at least one line break
	lexerInstance.addRule(/.*([\r\n])+.*/, lexer => {
		output.push({ type: "quote", value: encode(textToTokenize) });
		lexer.terminate();
	});

	// ** code
	lexerInstance.addRule(/\s`.+`/, lexer => {
		output.push({ type: "word", value: encode(' ') });
		output.push({ type: "code", value: encode(chop(2, lexer.text, 1)) });
	});

	// ** urls
	lexerInstance.addRule(/\shttps?:\/\/\S+/, lexer => {
		output.push({ type: "word", value: encode(' ') });
		output.push({ type: "url", value: encode(chop(1,lexer.text,0)) });
	});

	// ** italics
	lexerInstance.addRule(/\s_{ALPHA_NUM_CHAR_SPACE}+?_/, lexer => {
		output.push({ type: "word", value: encode(' ') });
		output.push({ type: "italics", value: encode(chop(2, lexer.text, 1)) });
	});

	// ** bold
	lexerInstance.addRule(/\s\*{ALPHA_NUM_CHAR_SPACE}+?\*/, lexer => {
		output.push({ type: "word", value: encode(' ') });
		output.push({ type: "bold", value: encode(chop(2, lexer.text, 1)) });
	});

	// ** spoiler
	lexerInstance.addRule(/\s\|{ALPHA_NUM_CHAR_SPACE}+?\|/, lexer => {
		output.push({ type: "word", value: encode(' ') });
		output.push({ type: "spoiler", value: encode(chop(2, lexer.text, 1)) });
	});

	// ** strikethrough
	lexerInstance.addRule(/\s~{ALPHA_NUM_CHAR_SPACE}+?~/, lexer => {
		output.push({ type: "word", value: encode(' ') });
		output.push({ type: "strikethrough", value: encode(chop(2, lexer.text, 1)) });
	});

	// ** emoticons
	lexerInstance.addRule(/:{ALPHA_NUM}+:/, lexer => {
		const emoticon = chop(1, lexer.text, 1);
		const isRealEmoticon = !!emoticonHash[emoticon];
		if (isRealEmoticon) {
			output.push({ type: "emoticon", value: encode(emoticon) });
		} else {
			output.push({ type: "word", value: encode(lexer.text) });
		}
	});

	// ** words and letters
	lexerInstance.addRule(/\s*{ALPHA_NUM_CHAR}*/, lexer => {
		output.push({ type: "word", value: encode(lexer.text) });
	});

	// ** emoji
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
