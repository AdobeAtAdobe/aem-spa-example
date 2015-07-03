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
var teamSite = angular.module('appAAA', ['angular-carousel','ui.router', 'Routing','videowaypointsModule', 'projectexplorerModule'])
	.run(function($rootScope,$log,$timeout,PageMetaData){

		/****
		 * convenience method that returns aa bool telling us if we should use partials or not.  This helps us with editing in author mode.
		 * @returns {boolean}
		 */
		$rootScope.usePartials = function(){
			if($rootScope.isPublisher() == "true"){
				return true;
			}else{
				return false;
			}
		};

		/***
		 * $stateChangeStart event
		 * Fired when the transition begins before the view is inserted
		 */
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
		});

		/***
		 * $stateChangeSuccess
		 * fired once the state transition is complete
		 */
		$rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
		});

		/****
		 * $viewContentLoaded - fired once the view is loaded, after the DOM is rendered.
		 */
		$rootScope.$on('$viewContentLoaded',function(event, viewConfig){
			//gets called twice on initial page load

			//if we are not on publish server we need to make sure the links reload the page
			if (!$rootScope.usePartials()) {
				$rootScope.enableHrefPageReload();
			}else{
				window.picturefill();//set dynamic images up if they exist on the new partial

				//we will need to re-init some items that rely on document ready
				PageMetaData.updateHeaderToReflectPartialData();
			}

			//scroll to top of the page so the user sees the hero
			window.scrollTo(0,0);
		});

		/***
		 * enableHrefPageReload
		 *
		 * Adds _self to all links in the document to disable partial loading and do full page loading when a link is selected.
		 * We use this to help navigate while on the authoring server
		 */
		$rootScope.enableHrefPageReload = function(){
			angular.element("a:visible").each(function(index) {
				$(this).attr("target","_self");
			});

			angular.element("a:hidden").each(function(index) {
				$(this).attr("target","_self");
			});
		};

		/***
		 * isPublisher
		 * convenience method that checks for the page meta tag named publisher we set when we rendered the page from Sightly.
		 * It tells us if wcmMode is publish
		 *
		 * @returns {string}
		 */
		$rootScope.isPublisher = function(){
			var resolvedMetaTagValue = "false";
			var elmPublisher = $('meta[name=publisher]').attr("content");
			if(typeof elmPublisher != 'undefined'){
				resolvedMetaTagValue = elmPublisher.toLowerCase();
			}

			return resolvedMetaTagValue;
		};
	})

	/***
	 * configuring the state provider and loading in the routes in our application
	 */
	.config(function ($stateProvider, $urlRouterProvider, routerProvider, $locationProvider) {
		$stateProvider
			.state('start', {
				url: location.pathname,
				templateUrl: location.pathname.replace('.html', '.partial.html')
			});

		$urlRouterProvider.otherwise(location.pathname);

		//really does not need to be an absolute path but thats what we did
		routerProvider.setCollectionUrl('/content/teamsite/jcr:content.routes.json');

		//Set the location provider to html5mode to make the urls pretty
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');
	})

	.service('PageMetaData', function($location) {
		var _title = 'Love what you do';
		var _keywords = 'adobe@adobe,adobe,adobeAtadobe,photoshop,edge,aem,illustrator,dps,digital marketing,creative cloud,creative';
		var _description = 'We make stuff';
		var _url = '';

		return {
			title: function() {
				return typeof $('#partialTitle').attr('content') != 'undefined' ? $('#partialTitle').attr('content') : _title
			},
			setTitle: function(newTitle) {
				_title = _title;
				document.title = _title;
				$('#ogTitle').attr('content',_title);
				$('#twitterTitle').attr('content',_title);
			},
			keywords: function() {
				return typeof $('#partialKeywords').attr('content') != 'undefined' ? $('#partialKeywords').attr('content') : _keywords
			},
			setKeywords: function(newKeywords) {
				_keywords = newKeywords;
				$('meta[name=keywords]').attr('content',_keywords);
			},
			description: function() {
				return typeof $('#partialDescription').attr('content') != 'undefined' ? $('#partialDescription').attr('content') : _description;
			},
			setDescription: function(newDescription) {
				_description = newDescription;
				$('meta[name=description]').attr('content',_description);
				$('#ogDescription').attr('content',_description);
				$('#twitterDescription').attr('content',_description);
			},
			url: function() { return _url; },
			setUrl: function(newUrl) { _
				_url = newUrl;
				$('#ogUrl').attr('content',_url);
			},
			getPartialMetaDescription:function(){
				var partialMetaDesc = $('#partialDescription').attr('content');
				if(typeof  partialMetaDesc == 'undefined') {
					partialMetaDesc = "no description found";
				}

				return partialMetaDesc;
			},
			getPartialDirectLink:function(){
				var partialDirectLink = $('#partialDirectLink').attr('content');
				if(typeof  partialDirectLink == 'undefined') {
					partialDirectLink = $location.url();
				}

				return partialDirectLink;
			},
			getPartialKeywords:function(){
				var partialKeywords = $('#partialKeywords').attr('content');
				if(typeof  partialKeywords == 'undefined') {
					partialKeywords = _keywords;
				}

				return partialKeywords;
			},
			getPartialTitle:function(){
				var partialTitle = $('#partialTitle').attr('content');
				if(typeof  partialTitle == 'undefined') {
					partialTitle = _title;
				}

				return partialTitle;
			},
			updateHeaderToReflectPartialData: function(){
				this.setDescription(this.getPartialMetaDescription());
				this.setUrl(this.getPartialDirectLink());
				this.setKeywords(this.getPartialKeywords());
				this.setTitle(this.getPartialTitle());
			}
		};
	})

	/*****
	 * DeviceDetection
	 * BrowserMap.getMatchedDeviceGroups() gets the matching device group
	 * /etc/clientlibs/browsermap.standard/libs/browsermap/devicegroups.js
	 *
	 * UNUSED AT THIS POINT
	 */
	.service('DeviceDetection',function(){
		return {
			getMatchedDeviceGroups: function(){
				if(typeof BrowserMap != "undefined"){
					return BrowserMap.getMatchedDeviceGroups();
				}else{
					return {};
				}
			}
		}
	})

	.controller('PageCtrl', function($scope,$window,$log,router) {
		$scope.reload = function() {
			router.setUpRoutes();
		};

		$scope.init = function(){
		};

	})