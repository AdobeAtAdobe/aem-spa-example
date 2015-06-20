/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2013 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
angular.module('videowaypointsModule',[])
    .directive('videoplayer', function ($location,$log) {
      return {
        restrict: 'C', //E = element, A = attribute, C = class, M = comment
        scope: {}, //new scope
        link: function ($scope, element, attrs) {

            /***** page hidden logic *****/
            // Set the name of the hidden property and the change event for visibility
            var hidden, visibilityChange;
            if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
                hidden = "hidden";
                visibilityChange = "visibilitychange";
            } else if (typeof document.mozHidden !== "undefined") {
                hidden = "mozHidden";
                visibilityChange = "mozvisibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
            }

            /*************
             * If the page is hidden, pause the video;
             * the page is shown, play the video
             */
            function handleVisibilityChange() {
                if (document[hidden]) {
                    element[0].pause();
                } else {
                    element[0].play();
                }
            }

            element.on('$destroy', function () {
                document.removeEventListener(visibilityChange, handleVisibilityChange, false);
                $log.debug("visibilityChange event listener distroyed");
            });

            // Warn if the browser doesn't support addEventListener or the Page Visibility API
            if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
                $log.info("The hide feature requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
            } else {
                // Handle page visibility change
                document.addEventListener(visibilityChange, handleVisibilityChange, false);
            }

            /***** END page hidden logic *****/


            /***** Waypoint logic *****/
            if(typeof $(element[0]).data("videowaypointsstopwhenoutofview") != "undefined") {
                $(element[0]).waypoint(function (direction) {
                    if (direction === "down") {
                        //$log.debug("waypoint on video-area down hit");
                        element[0].pause();
                    }
                }, {
                    offset: function () {
                        //when this is init the video area has no size so we need to use the placeholder image
                        return -$(element[0]).height();
                    }
                });
                $(element[0]).data("waypointsSet",true);
            }

            if(typeof $(element[0]).data("videowaypointsstartwheninview") != "undefined") {
                $(element[0]).waypoint(function (direction) {
                    if (direction === "up") {
                        //$log.debug("waypoint on video-area up hit");
                        element[0].play();
                    }
                }, {
                    offset: function () {
                        //when this is init the video area has no size so we need to use the placeholder image
                        return -$(element[0]).height();
                    }
                });
                $(element[0]).data("waypointsSet",true);
            }
            /***** Waypoint logic END*****/

            /***
             * if the avs attribute is set lets look at the sources listed and figure out which ones we need to enable
             */
        }
      }
    });