app.controller('MessageLogController', function($rootScope, bunkerApi) {
    var self = this;
    this.messages = bunkerApi.message.query();
    $rootScope.$on('$sailsResourceCreated', function(evt, resource) {
        if(resource.model == 'message') {
            self.messages.push(resource.data);
        }
    });
});