angular.module('videoSourceModule',[])
    .directive('videosource', function ($location,$log) {

        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            link: function ($scope, element, attrs) {
                $log.debug("videosource ran");
            }
        }
    });