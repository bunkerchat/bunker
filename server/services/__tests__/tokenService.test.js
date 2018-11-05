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
    "text": "Fox",
    "type": "word",
  },
  Object {
    "text": ".",
    "type": "unknown",
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
	});
});
