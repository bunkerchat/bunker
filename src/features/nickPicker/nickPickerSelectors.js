export const getSearchValueNick = state => state.nickPicker.search;

export const getIsSelectedUser = user => state => state.nickPicker.selected === user;

export const getIsInSearchFilter = user => state => {
	const searchValue = getSearchValueNick(state);
	if (!searchValue || !searchValue.length) return true;
	return user.nick.toLowerCase().includes(searchValue);
};
