import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "./userSettingsActions";
import styled from "styled-components";
import { getUserTheme } from "./userSettingsSelectors.js";
import { useTitle } from "react-use";

const Container = styled.div`
	flex: 1;
	overflow: auto;
`;

const Settings = () => {
	useTitle("Settings - Bunker");

	const dispatch = useDispatch();
	const theme = useSelector(getUserTheme);

	const onThemeChange = event => dispatch(setTheme(event.target.value));

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

export default Settings;
