import React from "react";
import { connect } from "react-redux";
import { setTheme } from "./userSettingsActions";

const mapStateToProps = state => ({
	theme: state.userSettings.theme
});

const mapDispatchToProps = dispatch => ({
	setTheme: theme => dispatch(setTheme(theme))
});

class Settings extends React.PureComponent {
	onThemeChange = event => {
		this.props.setTheme(event.target.value);
	};

	render() {
		return (
			<div className="container-fluid mt-3">
				<form>
					<div className="form-group">
						<label>Theme</label>
						<select className="form-control" onChange={this.onThemeChange} value={this.props.theme}>
							<option value="cerulean">Cerulean</option>
							<option value="cosmo">Cosmo</option>
							<option value="journal">Journal</option>
							<option value="sandstone">Sandstone</option>
							<option value="simplex">Simplex</option>
							<option value="sketchy">Sketchy</option>
							<option value="solar">Solar</option>
							<option value="spacelab">Spacelab</option>
							<option value="superhero">Superhero</option>
							<option value="yeti">Yeti</option>
						</select>
					</div>
				</form>
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Settings);
