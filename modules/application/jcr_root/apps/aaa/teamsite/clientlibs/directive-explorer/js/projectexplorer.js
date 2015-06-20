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
angular.module('projectexplorerModule',[])
    .directive('projectexplorer', function ($location) {


        /*
         * I modify the dom outside of the directive in some cases, and do some other things that are not really angular directive friendly, still a work in progress to clean this all up and make it work with AEM.
         */

        var VIDEO_SELECTOR = '.project-explore-element';

        var currentProject = 0,
            projectScrollHeight = 1000,
            articleSlideSpeed = 600,
            projectContainerHeight = 500,
            projectContainer,
            projectElements,
            totalProjects = 0,
            windowResizeTimeout = null,
            allowWheelScroll = true,
            blurbTextArray = [],
            linkArray = [];

        var blurbElement = $('<div></div>');
            blurbElement.addClass('blurb-element');

        var rightArrowElement = $('<div></div>').addClass('right-arrow-helper');
            blurbElement.append(  rightArrowElement );

        var downArrowElement = $('<div></div>');
            downArrowElement.addClass('down-arrow-helper');

        var rightTrackerDots = $('<div></div>').addClass('right-tracker-dots');

        var currentDeviceGroup;




                var scrollToNextProject = function () {

                    currentProject = Math.min(currentProject +1, totalProjects-1);
                    scrollProject( currentProject, -projectContainerHeight, articleSlideSpeed);
                    setBlurbText(currentProject);

                };

                var scrollToPreviousProject = function () {

                    scrollProject( currentProject, 0 , articleSlideSpeed);
                    currentProject--;
                    setBlurbText(currentProject);
                };

                var scrollProject = function (nextArticleIndex, distance,duration) {

                    var nextArticle = $(projectElements[nextArticleIndex]);

                    nextArticle.css('transition-duration', (duration/1000).toFixed(1) + 's');
                    nextArticle.css('transition-timing-function','ease');
                    //inverse the number we set in the css
                    var value = (distance<0 ? '-' : '') + Math.abs(distance).toString();
                    nextArticle.css('transform', 'translate3d(0px,'+value+'px,0px) translateZ(0)');



                };


                var onProjectExploreResize = function(event) {

                    if ( windowResizeTimeout )
                        clearTimeout(windowResizeTimeout);

                    windowResizeTimeout = setTimeout(function () {
                        windowResizeTimeout = 0;
                        resetProjectScrollHeight();
                        resetImageSizesAndLocations();
                        resetCurrentProject();
                        resetDots();
                    }, 100);

                };

                var onProjectExploreMouseWheel = function(event) {

                    if ( !allowWheelScroll )
                    {
                        event.preventDefault();
                        return;
                    }

                    var down = (event.originalEvent.wheelDelta < 0);

                    if ( down && currentProject != totalProjects -1 ) {

                        allowWheelScroll = false;
                        event.preventDefault();
                        scrollToNextProject();

                    } else if ( !down && currentProject != 0 ) {

                        if ( $(window).scrollTop() == 0 ) {
                            allowWheelScroll = false;
                            event.preventDefault();
                            scrollToPreviousProject()
                        }
                    }

                    if ( !allowWheelScroll ) {
                        setTimeout(function(){ allowWheelScroll = true}, 800);
                    }

                };

                var resetProjectScrollHeight = function () {

                    projectContainerHeight =$(window).innerHeight();

                    projectContainer.css({
                        height:projectContainerHeight
                    })

                };

                var resetImageSizesAndLocations = function () {

                    var jWin = $(window);
                    var winHeight = jWin.innerHeight();
                    var winWidth = jWin.innerWidth();
                    var landscape = false;

                    var allProps = {};

                    if ( ( winHeight / winWidth )  > 0.5626 ) {

                        allProps['height'] = winHeight;
                        allProps['width'] = '';
                    } else {
                        landscape = true;
                        allProps['height'] = '';
                        allProps['width'] = winWidth;
                    }


                    projectElements.each( function(index,item) {

                        var video = $(item).find('video');

                        video[0].removeAttribute('controls');

                        var cssProps = allProps;

                        if ( landscape ) {
                            cssProps['margin-left'] = 0;
                        } else {
                            cssProps['margin-left'] = - (video.width() / 2 ) + (winWidth / 2)
                        }

                        video.css(cssProps);

                        if ( index != 0 ) {
                            $(item).css('top',projectContainerHeight);
                            $(item).css('position','absolute');
                        }

                    });

                };

                var resetCurrentProject = function() {

                    if ( currentProject != 0 ) {

                        var counter = currentProject;
                        var element;

                        while ( counter != 0 ) {

                            element = $(projectElements[counter]);
                            element.css('transform', 'translate3d(0px,' + -projectContainerHeight + 'px,0px) translateZ(0)');

                            counter--;
                        }

                    }
                };

                var resetDots = function(justTheDots) {

                    if ( !justTheDots ) {
                        var winHeight = $(window).innerHeight();
                        var dotsHeight = rightTrackerDots.height();
                        var newHeight = winHeight / 2 - dotsHeight / 2;

                        rightTrackerDots.css('top',newHeight);
                    }

                    rightTrackerDots.find('.dot.selected').removeClass('selected');
                    rightTrackerDots.find('.dot:nth-child('+ (currentProject+1) +')').addClass('selected');

                    if ( currentProject == (totalProjects-1 ) )
                        downArrowElement.css('display','none');
                    else
                        downArrowElement.css('display','block');
                };

                var blurbLineSizeThreshold;
                var innerDiv;

                var setupBlurbElement = function() {

                    //reset
                    var tempInnerDiv = $('.blurb-element .blurb-inner-div');
                    if ( tempInnerDiv.length > 0 )
                        tempInnerDiv.remove();

                    innerDiv = $('<div></div>');
                    innerDiv.addClass('blurb-inner-div');


                    //get this from the css eventually

                    var outerDiameter = 320;

                    //root 2(r^2) to get h
                    var innerSize = Math.round( Math.sqrt( 2 * Math.pow( outerDiameter / 2, 2 ) ) );

                    //top/left offset = outerDiameter / 2 - innerSize / 2;

                    var offset =  outerDiameter / 2 - innerSize / 2;

                    innerDiv.css({
                        width:innerSize*5,
                        height:innerSize,
                        top: offset,
                        left: offset
                    });


                    blurbLineSizeThreshold = innerSize;
                    blurbElement.append(innerDiv);

                };


                var extractBlurbText = function() {

                    projectElements.each( function(index,item) {

                        var blurbString = $(item).data('blurb-text');
                        blurbString = typeof blurbString == 'undefined' ? '' : blurbString;
                        blurbString = blurbString.replace(/<[^>]*>/g, '');//strip out any html tags that might have ended up in here;
                        blurbTextArray.push(blurbString);

                        var linkString = $(item).data('work-page');
                        linkArray.push(linkString);

                    });
                };

                var setBlurbText = function(index) {

                    resetDots(true);

                    var blurbString = blurbTextArray[index];
                    var blurbWords = blurbString.split(' ');

                   // console.log(blurbWords);
                    var currentTextElements =  innerDiv.children('.blurb-text');

                    //change this to listen for events rather then a bunch of setTimeoots
                    currentTextElements.each(function(index,item){

                        setTimeout(function(){

                            $(item).css({
                                transform:'translate3d('+ -400 +'px,0,0)'
                            });

                            setTimeout(function(){

                                 $(item).remove();

                            }, index*100 + 1000);

                        }, index*100);

                    });

                    var shadowDiv = $('<div></div>');
                        shadowDiv.addClass('blurb-shadow-div');
                        blurbElement.append(shadowDiv);


                    while ( blurbWords.length > 0 ) {

                        var div = $('<div></div>');
                        div.addClass('blurb-text');
                        shadowDiv.append(div);

                        var lastWordAdded;

                        var word = blurbWords.shift();
                        lastWordAdded = addAdditionalWord(div, word, blurbLineSizeThreshold );

                        while ( lastWordAdded &&  blurbWords.length > 0 ) {
                            word = blurbWords.shift();
                            lastWordAdded = addAdditionalWord(div, word, blurbLineSizeThreshold );

                            if ( !lastWordAdded ) {
                                blurbWords.unshift(word);
                            }
                        }

                    }

                    var textDivs = shadowDiv.children('.blurb-text');

                    textDivs.each( function(index,item) {

                        var newItem = $(item).clone();

                            newItem.css({
                                position:'absolute',
                                transform:'translate3d(' + (blurbLineSizeThreshold + 100) +'px,0,0)',
                                top:index * 40
                            });

                            //add vendor prefixes
                            newItem.css({transition:'all 1s ease'});
                            innerDiv.append(newItem);

                            setTimeout(function(){
                                newItem.css('transform','translate3d(0,0,0)');
                            }, 250 * index + 100)


                    });

                    shadowDiv.remove();


                };

                var addAdditionalWord = function(span, word, widthCap) {


                    if ( span.width() >= widthCap ) {

                   //     console.log('span.width() > widthCap, returning false');
                        return false;
                    }

                    var currentText = span.text();

                    if ( currentText == '' ) {
                  //      console.log('currentText is blank');
                        span.text( word );
                    } else {
                  //      console.log('currentText is not blank');
                        span.text(currentText + ' ' + word );
                    }

                  //  console.log('span new width: ' + span.width() );
                    if ( span.width() >= widthCap ) {

                   //     console.log('newSpan width is > widthCap, resetting text to ', currentText);
                        span.text(currentText);
                        return false;
                    }  else {

                        if ( span.width() == 0 ) {
                   //         console.log('new span width is 0, returning false');
                            return false;
                        } else {
///
                   //         console.log('newSpan width is good, returning true');
                            return true;
                        }

                    }

                };


        return {
            restrict: 'A', //E = element, A = attribute, C = class, M = comment
            scope: true, //no new scope
            link: function ($scope, element, attrs) {


                var isPublisher = typeof $('meta[name=publisher]').attr('content') != 'undefined' ? $('meta[name=publisher]').attr('content'): 'false';

                if ( isPublisher == 'false' ) {
                    console.log('Not on publisher');
                    return;
                }

                element.append(blurbElement);
                element.append(downArrowElement);

                projectContainer = element;
                projectElements = element.find(VIDEO_SELECTOR);
                totalProjects = projectElements.length;



                while ( rightTrackerDots.children().length < totalProjects ){

                   var dot = $('<div></div>').addClass('dot');

                   if ( rightTrackerDots.children().length == 0 )
                       dot.addClass('selected');

                    rightTrackerDots.append(dot);
                }

                element.append(rightTrackerDots);

                currentProject = 0;
                windowResizeTimeout = null;
                allowWheelScroll = true;

                $(window).on('resize', onProjectExploreResize);
                $(window).on('mousewheel DOMMouseScroll', onProjectExploreMouseWheel);

                extractBlurbText();
                setupBlurbElement();
                setBlurbText(0);
                resetProjectScrollHeight();
                resetImageSizesAndLocations();
                resetDots();

                setTimeout(function(){
                    onProjectExploreResize();
                }, 300);




                blurbElement.touchSwipe({
                    tap:function(){
                        ///fire off a route change here
                        var gotoPage = linkArray[currentProject];
                        $location.url(gotoPage);
                    }
                });

                $scope.$on(
                    '$destroy',
                    function () {
                        //console.log('Project Explorer Directive destroyed');
                        $(window).off('resize', onProjectExploreResize);
                        $(window).off('mousewheel DOMMouseScroll', onProjectExploreMouseWheel);
                    }
                );

                projectContainer.touchSwipe( {
                    swipeStatus :  function(event, phase, direction, distance, fingers)
                    {
                        event.preventDefault();
                        //console.log('swipe status trigged',direction);
                        //If we are moving before swipe, and we are going L or R, then manually drag the images
                        if( phase=='move' && (direction=='up' || direction=='down') ) {
                            var duration = 0;
                            var nextArticle = 0;

                            if (direction == 'down') {

                                if ( currentProject != 0 ) {
                                    scrollProject(currentProject,  -projectContainerHeight + distance, duration);
                                }

                            } else if (direction == 'up') {

                                if (currentProject != totalProjects - 1) {
                                    nextArticle = Math.min(currentProject + 1, totalProjects - 1);
                                    scrollProject(nextArticle, -distance, duration);
                                }
                            }
                        }

                        //Else, cancel means snap back to the begining
                        else if ( phase == 'cancel')
                        {
                            //  scrollProject( projectScrollHeight * currentArticle, articleSlideSpeed);
                        }

                        //Else end means the swipe was completed, so move to the next image
                        else if ( phase =='end' )
                        {
                            if (direction == 'up' )
                            {
                                if (currentProject != totalProjects - 1)
                                    scrollToNextProject();

                            } else if (direction == 'down') {

                                if ( currentProject != 0 )
                                    scrollToPreviousProject();
                            }
                        }
                    } ,

                    allowPageScroll:'none'
                });



            }
        }

    });







