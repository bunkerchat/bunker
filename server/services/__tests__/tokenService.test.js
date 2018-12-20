const emoticonService = require("../emoticonService.js");
const tokenService = require("../tokenService");

describe("tokenService", () => {
	beforeAll(() => {
		return emoticonService.getEmoticonNamesFromDisk();
	});

	describe("tokenize", () => {
		it("sentence", () => {
			const tokens = tokenService.tokenize("The Quick Brown Fox.");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "type": "word",
    "value": "The ",
  },
  Object {
    "type": "word",
    "value": "Quick ",
  },
  Object {
    "type": "word",
    "value": "Brown ",
  },
  Object {
    "type": "word",
    "value": "Fox.",
  },
]
`);
		});

		it("code", () => {
			const tokens = tokenService.tokenize("code `<foo> bar </foo>` is awesome");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "type": "word",
    "value": "code ",
  },
  Object {
    "type": "code",
    "value": "&#60;foo&#62; bar &#60;/foo&#62;",
  },
  Object {
    "type": "word",
    "value": " ",
  },
  Object {
    "type": "word",
    "value": "is ",
  },
  Object {
    "type": "word",
    "value": "awesome",
  },
]
`);
		});

		it("underscores are italics", () => {
			const tokens = tokenService.tokenize("One does not _simply_ hank a hankerson.");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "type": "word",
    "value": "One ",
  },
  Object {
    "type": "word",
    "value": "does ",
  },
  Object {
    "type": "word",
    "value": "not ",
  },
  Object {
    "type": "italics",
    "value": "simply",
  },
  Object {
    "type": "word",
    "value": " ",
  },
  Object {
    "type": "word",
    "value": "hank ",
  },
  Object {
    "type": "word",
    "value": "a ",
  },
  Object {
    "type": "word",
    "value": "hankerson.",
  },
]
`);
		});

		it("code with nested underscores", () => {
			const tokens = tokenService.tokenize("code `<foo> _bar_ </foo>` is awesome");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "type": "word",
    "value": "code ",
  },
  Object {
    "type": "code",
    "value": "&#60;foo&#62; _bar_ &#60;/foo&#62;",
  },
  Object {
    "type": "word",
    "value": " ",
  },
  Object {
    "type": "word",
    "value": "is ",
  },
  Object {
    "type": "word",
    "value": "awesome",
  },
]
`);
		});
		it("bold", () => {
			const tokens = tokenService.tokenize("Bunker is *mediocre*.");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "type": "word",
    "value": "Bunker ",
  },
  Object {
    "type": "word",
    "value": "is ",
  },
  Object {
    "type": "bold",
    "value": "mediocre",
  },
  Object {
    "type": "word",
    "value": ".",
  },
]
`);
		});

		it("bold with spaces", () => {
			const tokens = tokenService.tokenize("bold with *some spaces*.");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "type": "word",
    "value": "bold ",
  },
  Object {
    "type": "word",
    "value": "with ",
  },
  Object {
    "type": "bold",
    "value": "some spaces",
  },
  Object {
    "type": "word",
    "value": ".",
  },
]
`);
		});

		it("spoiler", () => {
			const tokens = tokenService.tokenize("My dogs |eat fish|.");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "type": "word",
    "value": "My ",
  },
  Object {
    "type": "word",
    "value": "dogs ",
  },
  Object {
    "type": "spoiler",
    "value": "eat fish",
  },
  Object {
    "type": "word",
    "value": ".",
  },
]
`);
		});

		it("strikethrough", () => {
			const tokens = tokenService.tokenize("My ~dogs~ cats eat fish.");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "type": "word",
    "value": "My ",
  },
  Object {
    "type": "strikethrough",
    "value": "dogs",
  },
  Object {
    "type": "word",
    "value": " ",
  },
  Object {
    "type": "word",
    "value": "cats ",
  },
  Object {
    "type": "word",
    "value": "eat ",
  },
  Object {
    "type": "word",
    "value": "fish.",
  },
]
`);
		});

		it("url", () => {
			const tokens = tokenService.tokenize("Yo! Plz visit https://www.bunkerchat.net !");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "type": "word",
    "value": "Yo! ",
  },
  Object {
    "type": "word",
    "value": "Plz ",
  },
  Object {
    "type": "word",
    "value": "visit ",
  },
  Object {
    "type": "url",
    "value": "https://www.bunkerchat.net",
  },
  Object {
    "type": "word",
    "value": " ",
  },
  Object {
    "type": "word",
    "value": "!",
  },
]
`);
		});

		it("url contains underscores", () => {
			const tokens = tokenService.tokenize("Plz visit https://www.somesite.derp/foo_bar_derptown !");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "type": "word",
    "value": "Plz ",
  },
  Object {
    "type": "word",
    "value": "visit ",
  },
  Object {
    "type": "url",
    "value": "https://www.somesite.derp/foo_bar_derptown",
  },
  Object {
    "type": "word",
    "value": " ",
  },
  Object {
    "type": "word",
    "value": "!",
  },
]
`);
		});

		describe("image", () => {
			it("png", () => {
				const tokens = tokenService.tokenize("https://bnkr.net/blah.png");
				expect(tokens[0]).toMatchObject({ type: "image", value: "https://bnkr.net/blah.png" });
			});

			it("gif", () => {
				const tokens = tokenService.tokenize("https://bnkr.net/blah.gif");
				expect(tokens[0]).toMatchObject({ type: "image", value: "https://bnkr.net/blah.gif" });
			});

			it("jpg", () => {
				const tokens = tokenService.tokenize("https://bnkr.net/blah.jpg");
				expect(tokens[0]).toMatchObject({ type: "image", value: "https://bnkr.net/blah.jpg" });
			});

			it("jpeg", () => {
				const tokens = tokenService.tokenize("https://bnkr.net/blah.jpeg");
				expect(tokens[0]).toMatchObject({ type: "image", value: "https://bnkr.net/blah.jpeg" });
			});

			it("multiple in one message", () => {
				const tokens = tokenService.tokenize(
					"3 formats https://bnkr.net/blah.png http://bnkr.net/blah.gif https://bnkr.net/blah.jpg"
				);
				expect(tokens[2]).toMatchObject({ type: "image", value: "https://bnkr.net/blah.png" });
				expect(tokens[4]).toMatchObject({ type: "image", value: "http://bnkr.net/blah.gif" });
				expect(tokens[6]).toMatchObject({ type: "image", value: "https://bnkr.net/blah.jpg" });
			});
		});

		it("quote", () => {
			const ipsum = `Lorem ipsum dolor sit amet,
consectetur adipiscing elit,
sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;

			const tokens = tokenService.tokenize(ipsum);

			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "type": "quote",
    "value": "Lorem ipsum dolor sit amet,&#10;consectetur adipiscing elit,&#10;sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
]
`);
		});

		it("emoticons", () => {
			const tokens = tokenService.tokenize(":heart: jpro is an :angel: to me :fakeemoticon:");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "type": "emoticon",
    "value": "heart",
  },
  Object {
    "type": "word",
    "value": " ",
  },
  Object {
    "type": "word",
    "value": "jpro ",
  },
  Object {
    "type": "word",
    "value": "is ",
  },
  Object {
    "type": "word",
    "value": "an ",
  },
  Object {
    "type": "emoticon",
    "value": "angel",
  },
  Object {
    "type": "word",
    "value": " ",
  },
  Object {
    "type": "word",
    "value": "to ",
  },
  Object {
    "type": "word",
    "value": "me ",
  },
  Object {
    "type": "word",
    "value": ":fakeemoticon:",
  },
]
`);
		});

		it("mixing underscores and links", () => {
			const message = `This Fortnite_SUX spitfire https://www.youtube.com/watch?v=Jv1ZN8c4_Gs`;
			const tokens = tokenService.tokenize(message);
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "type": "word",
    "value": "This ",
  },
  Object {
    "type": "word",
    "value": "Fortnite",
  },
  Object {
    "type": "unknown",
    "value": "_",
  },
  Object {
    "type": "word",
    "value": "SUX ",
  },
  Object {
    "type": "word",
    "value": "spitfire ",
  },
  Object {
    "type": "url",
    "value": "https://www.youtube.com/watch?v=Jv1ZN8c4_Gs",
  },
]
`);
		});
	});
});
