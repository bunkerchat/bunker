export default {

	doSingleImageUpload: function (base64ImageData) {

		const headers = new Headers({
			'Authorization': 'Client-ID f9b49a92d8ec31b',
			'Accept': 'application/json'
		});

		const body = new FormData();
		body.append('type', 'base64');
		body.append('image', base64ImageData);

		const request = new Request('https://api.imgur.com/3/image', {
			headers,
			method: 'POST',
			mode: 'cors',
			body
		});

		return fetch(request)
			.then(response => response.json())
			.then(responseObj => responseObj.data.link);
	}
};
