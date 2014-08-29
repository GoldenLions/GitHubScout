var githubScout = angular.module('githubScout', [
	'ui-router'
])

.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: 'client/home/home.html',
			controller: 'HomeController'
		})
		.state('user', {
			url: '/user',
			templateUrl: 'client/user/user.html',
			controller: 'UserController'
		})
		.state('language', {
			url: '/language',
			templateUrl: 'client/language/language.html',
			controller: 'LanguageController'
		});

	$urlRouterProvider.otherwise('/');
})