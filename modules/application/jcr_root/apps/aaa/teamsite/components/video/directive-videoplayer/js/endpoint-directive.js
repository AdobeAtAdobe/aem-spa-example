angular.module('videoEndPointModule',[])
    .directive('endpoint', function ($log) {
        function link(scope,element,attrs, controller){
            $log.debug("endpoint link run");
            $log.debug(scope);
            $log.debug(controller.addVideoEndpoint());
        };

        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            scope: {},
            require: '^videowaypointsModule', //TODO: rename to VideoPlayer and breakup
            link: link
        }
    });