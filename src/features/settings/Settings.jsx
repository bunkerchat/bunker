import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";
import { setTheme } from "./userSettingsActions";

const Container = styled.div`
	flex: 1;
	overflow: auto;
`;

const EXCHANGE_RATES = gql`
	{
		rates(currency: "USD") {
			currency
			rate
		}
	}
`;

const Settings = ({
	theme,

	// actions
	setTheme
}) => {
	const { loading, error, data } = useQuery(EXCHANGE_RATES);
	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error :(</p>;

	const onThemeChange = event => {
		setTheme(event.target.value);
	};

	return (
		<Container className="container-fluid mt-3">
			<form>
				<div className="form-group">
					<label>Theme</label>
					<select className="form-control" onChange={onThemeChange} value={theme}>
						<option value="cerulean">Cerulean</option>
						<option value="classic">Classic</option>
						<option value="cosmo">Cosmo</option>
						<option value="journal">Journal</option>
						<option value="simplex">Simplex</option>
						<option value="sketchy">Sketchy</option>
						<option value="spacelab">Spacelab</option>
						<option value="superhero">Superhero</option>
					</select>
				</div>
			</form>
		</Container>
	);
};

const mapStateToProps = state => ({
	theme: state.userSettings.theme
});

const mapDispatchToProps = {
	setTheme
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Settings);
