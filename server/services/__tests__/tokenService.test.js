const tokenService = require("../tokenService");

describe("tokenService", () => {
	describe("tokenize", () => {
		it("derp", () => {
			const tokens = tokenService.tokenize("asdf");
			expect(tokens).toEqual([]);
		});
	});
});
