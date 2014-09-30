module.exports = {
  attributes: {
      token: {
          type: 'string',
          required: true,
          minLength: 20
      },
      nick: {
          type: 'string',
          required: true,
          minLength: 1
      },
      email: 'email',
	  rooms: 'array'
  }
};

