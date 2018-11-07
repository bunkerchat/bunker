const tokenService = require("../tokenService");

describe("tokenService", () => {
	describe("tokenize", () => {
		it("sentence", () => {
			const tokens = tokenService.tokenize("The Quick Brown Fox.");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "text": "The ",
    "type": "word",
  },
  Object {
    "text": "Quick ",
    "type": "word",
  },
  Object {
    "text": "Brown ",
    "type": "word",
  },
  Object {
    "text": "Fox.",
    "type": "word",
  },
]
`);
		});

		it("code", () => {
			const tokens = tokenService.tokenize("code `<foo> bar </foo>` is awesome");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "text": "code ",
    "type": "word",
  },
  Object {
    "text": "<foo> bar </foo>",
    "type": "code",
  },
  Object {
    "text": " ",
    "type": "word",
  },
  Object {
    "text": "is ",
    "type": "word",
  },
  Object {
    "text": "awesome",
    "type": "word",
  },
]
`);
		});

		it("underscores are italics", () => {
			const tokens = tokenService.tokenize("One does not _simply_ hank a hankerson.");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "text": "One ",
    "type": "word",
  },
  Object {
    "text": "does ",
    "type": "word",
  },
  Object {
    "text": "not ",
    "type": "word",
  },
  Object {
    "text": "simply",
    "type": "italics",
  },
  Object {
    "text": " ",
    "type": "word",
  },
  Object {
    "text": "hank ",
    "type": "word",
  },
  Object {
    "text": "a ",
    "type": "word",
  },
  Object {
    "text": "hankerson.",
    "type": "word",
  },
]
`);
		});

		it("code with nested underscores", () => {
			const tokens = tokenService.tokenize("code `<foo> _bar_ </foo>` is awesome");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "text": "code ",
    "type": "word",
  },
  Object {
    "text": "<foo> _bar_ </foo>",
    "type": "code",
  },
  Object {
    "text": " ",
    "type": "word",
  },
  Object {
    "text": "is ",
    "type": "word",
  },
  Object {
    "text": "awesome",
    "type": "word",
  },
]
`);
		});
		it("bold", () => {
			const tokens = tokenService.tokenize("Bunker is *mediocre*.");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "text": "Bunker ",
    "type": "word",
  },
  Object {
    "text": "is ",
    "type": "word",
  },
  Object {
    "text": "mediocre",
    "type": "bold",
  },
  Object {
    "text": ".",
    "type": "word",
  },
]
`);
		});

		it("spoiler", () => {
			const tokens = tokenService.tokenize("My dogs |eat fish|.");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "text": "My ",
    "type": "word",
  },
  Object {
    "text": "dogs ",
    "type": "word",
  },
  Object {
    "text": "eat fish",
    "type": "spoiler",
  },
  Object {
    "text": ".",
    "type": "word",
  },
]
`);
		});

		it("strikethrough", () => {
			const tokens = tokenService.tokenize("My ~dogs~ cats eat fish.");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "text": "My ",
    "type": "word",
  },
  Object {
    "text": "dogs",
    "type": "strikethrough",
  },
  Object {
    "text": " ",
    "type": "word",
  },
  Object {
    "text": "cats ",
    "type": "word",
  },
  Object {
    "text": "eat ",
    "type": "word",
  },
  Object {
    "text": "fish.",
    "type": "word",
  },
]
`);
		});

		it("url", () => {
			const tokens = tokenService.tokenize("Yo! Plz visit https://www.bunkerchat.net !");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "text": "Yo! ",
    "type": "word",
  },
  Object {
    "text": "Plz ",
    "type": "word",
  },
  Object {
    "text": "visit ",
    "type": "word",
  },
  Object {
    "text": "https://www.bunkerchat.net",
    "type": "url",
  },
  Object {
    "text": " ",
    "type": "word",
  },
  Object {
    "text": "!",
    "type": "word",
  },
]
`);
		});

		it("url contains underscores", () => {
			const tokens = tokenService.tokenize("Plz visit https://www.somesite.derp/foo_bar_derptown !");
			expect(tokens).toMatchInlineSnapshot(`
Array [
  Object {
    "text": "Plz ",
    "type": "word",
  },
  Object {
    "text": "visit ",
    "type": "word",
  },
  Object {
    "text": "https://www.somesite.derp/foo_bar_derptown",
    "type": "url",
  },
  Object {
    "text": " ",
    "type": "word",
  },
  Object {
    "text": "!",
    "type": "word",
  },
]
`);
		});
	});
});
