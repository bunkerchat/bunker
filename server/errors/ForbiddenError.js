function ForbiddenError() {
	var error = Error.apply(this, arguments);
	error.name = this.name = "ForbiddenError";
	this.message = error.message;
	return this;
}

// lame js error inheritance shenannigans.
var IntermediateInheritor = function() {};
IntermediateInheritor.prototype = Error.prototype;
ForbiddenError.prototype = new IntermediateInheritor();

module.exports = ForbiddenError;
