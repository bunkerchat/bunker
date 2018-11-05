const tokenService = require("../tokenService");

describe("tokenService", () => {
	describe("tokenize", () => {
		it("sentence", () => {
			const tokens = tokenService.tokenize("The Quick Brown Fox.");
			expect(tokens).toMatch([
				{ text: "The", type: "word" },
				{ text: " ", type: "space" },
				{ text: "Quick", type: "word" },
				{ text: " ", type: "space" },
				{ text: "Brown", type: "word" },
				{ text: " ", type: "space" },
				{ text: "Fox", type: "word" },
				{ text: ".", type: "unknown" }
			]);
		});
	});
});
