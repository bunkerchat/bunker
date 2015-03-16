
var Input = React.createClass({
	render() {
		return (
			<div className="container-fluid message-input">
				<div className="row">
					<form className="col-md-10 no-gutter">
						<div className="input-group">
							<textarea rows="1" className="form-control"
								autofocus></textarea>
							<span className="input-group-btn">
								<button type="submit" className="btn btn-success">Send</button>
							</span>
						</div>
					</form>
				</div>
			</div>
		);
	}
});

module.exports = Input;