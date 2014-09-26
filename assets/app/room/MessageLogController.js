app.controller('MessageLogController', function($rootScope, bunkerApi) {
    var self = this;
    bunkerApi.message.query({sort: 'createdAt DESC', limit: 50}, function(messages) {
        self.messages = angular.copy(messages, []);
    });
    $rootScope.$on('$sailsResourceCreated', function(evt, resource) {
        if(resource.model == 'message') {
            self.messages.push(resource.data);
        }
    });
});