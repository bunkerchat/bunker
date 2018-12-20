function InvalidInputError() {
	var tmp = Error.apply(this, arguments);
	tmp.name = this.name = "InvalidInputError";
	this.stack = tmp.stack;
	this.message = tmp.message;
	return this;
}

// lame js error inheritance shenannigans.
var IntermediateInheritor = function() {};
IntermediateInheritor.prototype = Error.prototype;
InvalidInputError.prototype = new IntermediateInheritor();

module.exports = InvalidInputError;
