peInit = function() {

    elementTopPoints = [];

    currentFixedElementIndex = 0;
    currentTopPoint = 0;
    peInitialized = false;

    var loadedImagesCounter = 0;
    projectElements = $('.project-explore-element');
    var max = projectElements.length;

    projectElements.each(function(index, item){
        console.log(index,item);

        var jItem = $(item);

        jItem.children('video').on('load', function() {

            var position = jItem.offset();

            jItem.data('original-top',position.top);
            jItem.data('original-left',position.left);

            elementTopPoints.push(position.top);
            loadedImagesCounter++;

            if ( loadedImagesCounter == max ) {
                setupProjectElements();
            }
        });
    });

    $(window).on('resize', function() {

        setupProjectElements();

    });

    $(window).on('scroll', function(event) {

        var currentScrollTop = $(window).scrollTop();

        if ( currentScrollTop == 0 )
        {
            setNewFixedElement(0);
        } else {
            var i = 0;
            //only need to lock the element once currentScrollTop > elementTop , 0 to X = lock 0, X to Y = lock X, Y to Z, lock Z
            while ( currentScrollTop > elementTopPoints[i] && i < elementTopPoints.length )
            {
                i++;

            }
            //console.log(i-1);
            setNewFixedElement(i-1);
        }

        resetScrollTimeout();

    });


    isBlerbShowing = true;
    scrollTimeout = false;

    resetScrollTimeout = function () {

        if ( isBlerbShowing ) {
            blerbElement.addClass("hidden");
        }

        if ( scrollTimeout ) {
            clearTimeout(scrollTimeout);
        }

        scrollTimeout = setTimeout(function(){
            blerbElement.removeClass("hidden");

        }, 700);
    };

    setupProjectElements = function() {

        if ( peInitialized ) {

            elementTopPoints = [];

            projectElements.each(function(index, item) {

                var jItem = $(item);

                var position = jItem.offset();
                jItem.data('original-top', position.top);
                jItem.data('original-left', position.left);
            });

        }

        peInitialized = true;

        elementTopPoints.sort(function(a,b){
            return (a-b);
        });

        var ultimateHeight = $('.projects-container').height();

        $('.projects-container').css({height:ultimateHeight});

        blerbElement = $('#blerb');

        for ( var i=0; i < projectElements.length; i++ ) {

            var item = $( projectElements[i] );
            var oTop = item.data('original-top');
            var oLeft = item.data('original-left');

            var pos = 'absolute';

            if ( i == 0 ) {
                pos = 'fixed';
                blerbElement.children('.text').text(item.data('blerb-text'));
            }

            item.css({
                position:pos,
                top: oTop,
                left: oLeft
            })
        }
    };

    setNewFixedElement = function(index) {

        if ( currentFixedElementIndex != index ) {

            var oldFixedIndex = currentFixedElementIndex;
            currentFixedElementIndex = index;

            var item = $(projectElements[index]);

            var pos = 'fixed';

            item.css({
                position: pos,
                top: 0,
                left: 0
            });

            blerbElement.children('.text').text(item.data('blerb-text'));

            var oldItem = $(projectElements[oldFixedIndex]);
            var oldTop = oldItem.data('original-top');
            var oldLeft = oldItem.data('original-left');
            var oldPos = 'absolute';

            oldItem.css({
                position: oldPos,
                top: oldTop,
                left: oldLeft
            })
        }
    };
};

//peInit();



currentProject = 0;
projectScrollHeight = 1000;
articleSlideSpeed = 200;
projectContainerHeight = 500;
projectContainer = $(".projects-container");
projectElements = $(".project-explore-element");
totalProjects = projectElements.length;

peInit2 = function() {

    //console.log("pe init");

    $("header").swipe({
        swipeStatus:function(){
            return false;
        },
        allowPageScroll:"none"
    });

    resetProjectScrollHeight();
    resetImageSizesAndLocations();

    projectContainer.swipe( {
        swipeStatus :  function(event, phase, direction, distance, fingers)
        {
            event.preventDefault();
            //console.log("swipe status trigged",direction);
            //If we are moving before swipe, and we are going L or R, then manually drag the images
            if( phase=="move" && (direction=="up" || direction=="down") ) {
                var duration = 0;
                var nextArticle = 0;

                if (direction == "down") {

                    if ( currentProject != 0 ) {
                        scrollProject(currentProject,  -projectContainerHeight + distance, duration);
                    }

                } else if (direction == "up") {

                    if (currentProject != totalProjects - 1) {
                        nextArticle = Math.min(currentProject + 1, totalProjects - 1);
                        scrollProject(nextArticle, -distance, duration);
                    }
                }
            }

            //Else, cancel means snap back to the begining
            else if ( phase == "cancel")
            {
              //  scrollProject( projectScrollHeight * currentArticle, articleSlideSpeed);
            }

            //Else end means the swipe was completed, so move to the next image
            else if ( phase =="end" )
            {
                if (direction == "up" )
                {
                    if (currentProject != totalProjects - 1)
                        scrollToNextProject();
                    // if ( Math.abs(distance) >= cmoMag.tocControls.articleScrollWidth/3 )

                    //     else
                    //       cmoMag.tocControls.scrollArticle(cmoMag.tocControls.articleScrollWidth * cmoMag.tocControls.currentArticle, cmoMag.tocControls.articleSlideSpeed);

                } else if (direction == "down") {

                    if ( currentProject != 0 )
                        scrollToPreviousProject();
                    //  if ( Math.abs(distance) >= cmoMag.tocControls.articleScrollWidth/3 )

                    //  else
                    //      cmoMag.tocControls.scrollArticle(cmoMag.tocControls.articleScrollWidth * cmoMag.tocControls.currentArticle, cmoMag.tocControls.articleSlideSpeed);
                }
            }
        } ,

        allowPageScroll:"none"
    });

};

scrollToNextProject = function () {

    currentProject = Math.min(currentProject +1, totalProjects-1);
    var scrollDistance = projectContainerHeight ;
    scrollProject( currentProject, -scrollDistance, articleSlideSpeed);

};

scrollToPreviousProject = function () {

    var scrollDistance = projectContainerHeight ;
    scrollProject( currentProject, 0 , articleSlideSpeed);
    currentProject--;
};

scrollProject = function (nextArticleIndex, distance,duration) {

    var nextArticle = $(projectElements[nextArticleIndex]);

    nextArticle.css("-webkit-transition-duration", (duration/1000).toFixed(1) + "s");
    nextArticle.css("-webkit-transition-timing-function","ease");
    //inverse the number we set in the css
    var value = (distance<0 ? "-" : "") + Math.abs(distance).toString();
    nextArticle.css("-webkit-transform", "translate3d(0px,"+value+"px,0px) translateZ(0)");


};

windowResizeTimeout = null;


$(window).on('resize', function() {

    if ( windowResizeTimeout )
        clearTimeout(windowResizeTimeout);

    windowResizeTimeout = setTimeout(function () {
        windowResizeTimeout = 0;
        resetProjectScrollHeight();
        resetImageSizesAndLocations();
        resetCurrentProject();
    }, 100);

});

allowWheelScroll = true;

$(window).on('mousewheel DOMMouseScroll', function(event) {


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

        allowWheelScroll = false;
        event.preventDefault();
        scrollToPreviousProject()

    }


    if ( !allowWheelScroll ) {
        setTimeout(function(){ allowWheelScroll = true}, 500);
    }


});


resetProjectScrollHeight = function () {

    projectContainerHeight = $(window).height();

    projectContainer.css({
        height:projectContainerHeight
    })

};

resetImageSizesAndLocations = function () {

    var jWin = $(window);
    var winHeight = jWin.height();
    var winWidth = jWin.width();
    var landscape = false;

    var allProps = {};

    if ( winHeight > winWidth ) {

        allProps['height'] = '100%';
        //allProps['height'] = winHeight;
        allProps['width'] = "";

    } else {

        landscape = true;
        allProps['height'] = "";
        allProps['width'] = '100%';
        //allProps['width'] = winWidth;
    }

    projectElements.each( function(index,item) {

        var image = $(item).children('video');
        var cssProps = allProps;
        var nWidth = image[0].naturalWidth;
        var nHeight = image[0].naturalHeight;

        if ( landscape ) {

            cssProps['margin-left'] = 0;

            if ( winHeight > image.height() ) {
                cssProps['height'] = winHeight;
            }

        } else {
            cssProps['margin-left'] = - (image.width() / 2 ) + (winWidth / 2)
        }

        image.css(cssProps);

        if ( index != 0 ) {
            $(item).css('top',projectContainerHeight);
        } else {

        }

    });

};

resetCurrentProject = function() {

    if ( currentProject != 0 ) {

        var counter = currentProject;
        var element;

        while ( counter != 0 ) {

            element = $(projectElements[counter]);
            element.css("-webkit-transform", "translate3d(0px," + -projectContainerHeight + "px,0px) translateZ(0)");

            counter--;
        }

    }
};


//peInit2();





