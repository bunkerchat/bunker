
module.exports = {
  attributes: {
	  roomId: {
		  type: 'string',
		  required: true,
		  index: true
	  },
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