
module.exports = function(request, response, next) {
    if(!request.user) {
        response.redirect('/login');
    }
    else {
        next();
    }
};