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
angular.module('bestRenditionVideoModule',[])
    .directive('selectBestRendition', function ($location,$log) {
      return {
        restrict: 'A', //E = element, A = attribute, C = class, M = comment
        link: function ($scope, element, attrs) {

            //BrowserMap
            if(typeof BrowserMap == 'undefined'){
                $log.error("BrowserMap lib is missing.  Its required for the adaptiveVideo directive");
            }else{
                BrowserMap.matchDeviceGroups();
            }

            $scope.videoSource = {};
            loadVideoSourceData();
            testGroupsWidth();
            enableVideoSource();

            /*************
             * Get all the video source tags
             *  Ignores all videos without the type="avs"
             */
            function getAllVideoSourceData() {
                var videoSource = element.find("source[type='sbr']");

                return videoSource;
            }

            /*************
             * loadVideoSourceData
             * pulls in the video source and sorts it and groups it
             */
            function loadVideoSourceData() {
                var videoSource = getAllVideoSourceData();

                //group the source by type
                angular.forEach(videoSource, function(value, key) {
                    //loop over the source tags and put them into the video source by the type tag
                    if(typeof this[value.dataset.srctype] == 'undefined'){
                        this[value.dataset.srctype] = [];
                    }
                    this[value.dataset.srctype].push(value);

                }, $scope.videoSource);
            }

            /************
             * testGroupsWidth
             * compare the width of the video element with the videos we have to select from and tag which ones are
             * good fits for the element.  Trying to avoid scaling down some massive file when there is a smaller
             * one we could use
             */
            function testGroupsWidth(){
                var elemWidth = element.width();
                angular.forEach($scope.videoSource, function(value, key) {
                    var typeGroup = value;

                    //get the closest match data
                    var closestMatch = getClosestWidthMatchFromVideoSet(elemWidth,typeGroup);
                    //did we find a good fit? if not use the closest
                    if(closestMatch.winner.sources.length > 0){
                        angular.forEach(closestMatch.winner.sources, function(value, key) {
                            angular.element(value).attr("data-widthmatch",true);
                        })
                    }else if(closestMatch.closest.sources.length > 0){
                        //well we did not find a good close match we could scale down so lets get the best match and scale up
                        angular.forEach(closestMatch.closest.sources, function(value, key) {
                            angular.element(value).attr("data-widthmatch",true);
                        })
                    }
                });
            }

            function enableVideoSource(){
                var matchedDeviceGroups = BrowserMap.getMatchedDeviceGroups();
                angular.forEach($scope.videoSource, function(value, key) {
                    var typeGroup = value;
                    var bandwidthSortResults = getBandwidthSetsFromVideoTypeSet(typeGroup);

                    if(matchedDeviceGroups["smartphone"] || matchedDeviceGroups["tablet"] && typeof bandwidthSortResults.low != 'undefined'){
                        //assume lower kbps
                        angular.element(bandwidthSortResults.low).attr("type",bandwidthSortResults.low.dataset.srctype);
                    }else if (typeof bandwidthSortResults.high != 'undefined'){
                        //assume higher kbps
                        angular.element(bandwidthSortResults.high).attr("type",bandwidthSortResults.high.dataset.srctype);
                    }
                });

                element.load();
            }

            /************
             * getClosestWidthMatchFromVideoSet
             *
             * look over the sources we have and pick one that is either the same size or slightly bigger.
             * If its a huge area and there are no bigger sources pick the largest
             */
            function getClosestWidthMatchFromVideoSet(elemWidth,videoSetArray){
                var videoSizeDiffResults = {};
                videoSizeDiffResults.sizeEvaluated = elemWidth;
                videoSizeDiffResults.winner = {};
                videoSizeDiffResults.closest = {};
                videoSizeDiffResults.winner.gap = 999999;  //if neg its too small for the area
                videoSizeDiffResults.winner.width = 999999;
                videoSizeDiffResults.winner.sources = [];
                videoSizeDiffResults.closest.gap = 999999; // we track both just in case there are no matches we may have to scale up
                videoSizeDiffResults.closest.width = 999999;
                videoSizeDiffResults.closest.sources = [];

                angular.forEach(videoSetArray, function(value, key) {
                    var sizeDiff = value.dataset.width - elemWidth;

                    if(sizeDiff <= videoSizeDiffResults.winner.gap && sizeDiff > 0){
                        videoSizeDiffResults.winner.gap = sizeDiff;
                        videoSizeDiffResults.winner.width = value.dataset.width;
                    }

                    if(Math.abs(sizeDiff) <= videoSizeDiffResults.closest.gap){
                        videoSizeDiffResults.closest.gap = Math.abs(sizeDiff);
                        videoSizeDiffResults.closest.realGap = sizeDiff;
                        videoSizeDiffResults.closest.width = value.dataset.width;
                    }
                });

                //add the sources that match, this is accounting for multiple bandwidth files.
                // IE 1024 at 6000kbps and 1024 at 1000kbps files
                angular.forEach(videoSetArray, function(value, key) {

                    if(value.dataset.width == videoSizeDiffResults.winner.width){
                        videoSizeDiffResults.winner.sources.push(value);
                    }

                    if(value.dataset.width == videoSizeDiffResults.closest.width){
                        videoSizeDiffResults.closest.sources.push(value);
                    }
                });

                return videoSizeDiffResults;
            }

            function getBandwidthSetsFromVideoTypeSet(avsSetArray){
                var currentLowVal = 999999;
                var currentHighVal = -1;
                var videoBandwidthSelection = {
                    low:{},medium:{},high:{}
                };

                //determine low
                angular.forEach(avsSetArray, function(value, key) {
                    if(value.dataset.widthmatch){
                        if(parseInt(value.dataset.videobitrate) < currentLowVal){
                            videoBandwidthSelection.low = value;
                            currentLowVal= parseInt(value.dataset.videobitrate);
                        }
                    }
                })

                //determine high
                angular.forEach(avsSetArray, function(value, key) {
                    if(value.dataset.widthmatch) {
                        if (parseInt(value.dataset.videobitrate) > currentHighVal) {
                            videoBandwidthSelection.high = value;
                            currentHighVal = parseInt(value.dataset.videobitrate);
                        }
                    }
                })

                //determine mid
                angular.forEach(avsSetArray, function(value, key) {
                    if(value.dataset.widthmatch) {
                        if (parseInt(value.dataset.videobitrate) < currentHighVal && parseInt(value.dataset.videobitrate) > currentLowVal) {
                            videoBandwidthSelection.medium = value;
                        }
                    }
                })

                return videoBandwidthSelection;
            }

        }
      }
    });