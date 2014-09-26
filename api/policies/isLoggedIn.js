
module.exports = function(request, response, next) {
    if(!request.user) {
        response.redirect('/login');
    }
    else {
        request.session.user = request.user; // user won't be available in socket calls without this
        next();
    }
};