angular.module('videoEndPointModule',[])
    .directive('endpoint', function ($location,$log) {
        /*************
         * Get all the endpoint tags
         */
        function getAllVideoEndPoints() {
            var videoEndPoints = element.find("endpoint");

            return videoEndPoints;
        }

        return {
            restrict: 'E', //E = element, A = attribute, C = class, M = comment
            link: function ($scope, element, attrs) {
                $scope.videoEndpoints = getAllVideoEndPoints();
            }
        }
    });