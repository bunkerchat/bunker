module.exports = {
  attributes: {
      openId: {
          type: 'string'
      },
      nick: {
          type: 'string',
          required: true,
          minLength: 1
      },
      email: 'email'
  }
};

