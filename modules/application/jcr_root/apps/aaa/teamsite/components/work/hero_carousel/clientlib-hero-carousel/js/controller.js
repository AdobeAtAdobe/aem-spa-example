//TODO:make this stand outside the application scope so its not hardcoded to our app
teamSite.controller('heroCarouselController', ['$scope', '$http', '$timeout','$log', function($scope,$http,$timeout,$log) {
    //this should be moved into the directive for the carousel.
    //going to cause problems if more than 1 carousel
    //also dom manipulation outside a directive is bad practice -.-

    var resizeHeroCarouselContainer = function() {

        var mediaWrapper = $('.media-area-wrapper');
        //var limitedWidthDiv = $('div.limited-width');
        var maxWidth = mediaWrapper.css('max-width');
        var maxHeight = mediaWrapper.css('max-height');
        var padding = mediaWrapper.css('padding-left');

        if ( padding != "" )
            padding = parseInt( padding.substr(0, padding.length-2) );

        if ( maxWidth != "" )
            maxWidth = parseInt( maxWidth.substr(0, maxWidth.length-2) );

        if ( maxHeight != "" )
            maxHeight = parseInt( maxHeight.substr(0, maxHeight.length-2) );

        var windowWidth = $(window).width();

        var newWidth = windowWidth < maxWidth ? windowWidth  : maxWidth;
        var newHeight = Math.round( ( (newWidth - padding * 2) / 16)*9);

            newHeight = newHeight < maxHeight ? newHeight : maxHeight ;


        mediaWrapper.css('width',newWidth);
        mediaWrapper.css('height',newHeight);
    };

    $(window).on('resize', resizeHeroCarouselContainer);

    //clean up listeners
    $scope.$on(
        "$destroy",
        function () {
            $(window).off('resize', resizeHeroCarouselContainer);
        }
    );

    resizeHeroCarouselContainer();
}]);
