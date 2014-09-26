app.factory('bunkerApi', function(sailsResource) {
    return {
        message: sailsResource('message')
    };
});