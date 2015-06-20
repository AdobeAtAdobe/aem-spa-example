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
teamSite.controller('NavContoller', function($scope,$window,$location,$log) {

    $scope.navCloseSymbol = {};
    $scope.clearHeaderBackgroundTimeout = 0;
    $scope.hamburgerClosed = true;
    //this shouldn't be in here,
    //either this should be moved to a directive that incldues the hamburger menu and the overlay or needs to be split up into two dif controllers,
    // not sure the best approach but dom manipulation directly here is bad.

    $("#navigationOverlay li").on( {mouseenter: function() {
        $(this).addClass( "over" );
    }, mouseleave: function() {
        $(this).removeClass( "over" );
    }, click: function() {
        $scope.toggleMenu(true);
    }
    });

    $scope.toggleMenu = function(force) {

        var trigger = $('#hamburger');

        if ( force ) {
            this.hamburgerClosed = false;
        }

        if ( this.hamburgerClosed ) {

            trigger.removeClass('is-closed');
            trigger.addClass('is-open');


            this.hamburgerClosed  = false;

            $("#navigationOverlay").addClass("open");

        } else {

            trigger.removeClass('is-open');
            trigger.addClass('is-closed');

            this.hamburgerClosed = true;
            $("#navigationOverlay").removeClass("open");
        }

    };


    $scope.closeOverlay = function(){

        console.log("closeOverlay closed");
        $scope.toggleMenu(true);

    };

    $(window).on('mousewheel DOMMouseScroll scroll', function() {

        var header = $("header");

        clearTimeout($scope.clearHeaderBackgroundTimeout);
        $scope.clearHeaderBackgroundTimeout = setTimeout(function() {
            header.removeClass("isShowing");
        }, 2500 );

        if ( !header.hasClass("isShowing") ) {
            header.addClass("isShowing");
        }

    });

    $scope.$on("$destroy", function() {
    });
});