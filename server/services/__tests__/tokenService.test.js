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
    "text": "_simply_ ",
    "type": "italics",
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
    "text": "*mediocre*",
    "type": "bold",
  },
  Object {
    "text": ".",
    "type": "word",
  },
]
`);
		});
	});
});
