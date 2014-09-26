
module.exports = {
  attributes: {
      author: {
          model: 'User',
          required: true
      },
      text: {
          type: 'string',
          required: true,
          minLength: 1
      }
  }
};