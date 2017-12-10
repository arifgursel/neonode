//Create app and inject the 'ngRoute' dependency
var myApp = angular.module('myApp', ['ngRoute', 'mm.foundation']);
//Use config method to set errthang up!
myApp.config(function($routeProvider, $locationProvider, $httpProvider) {
    $httpProvider.interceptors.push('authInterceptorFactory');
    $routeProvider
        .when('/', {
            redirectTo: '/welcome'
        })
        .when('/welcome', {
            templateUrl: '../partials/partial.welcome.html',
            controller: 'welcomeController'
        })
        .when('/signup', {
            templateUrl: '../partials/partial.signup.html',
            controller: 'authController'
        })
        .when('/login', {
            templateUrl: '../partials/partial.login.html',
            controller: 'authController'
        })
        //Post-Auth Routes
        .when('/home', {
            templateUrl: '../partials/partial.home.html',
            controller: 'homeController'
        })
        //User Audit Routes
        .when('/profile', {
            templateUrl: '../partials/partial.profile.html',
            controller: 'userProfileController'
        })
        .when('/updateProfile', {
            templateUrl: '../partials/partial.updateProfile.html',
            controller: 'userProfileController'
        })
        .when('/updateEmail', {
            templateUrl: '../partials/partial.updateEmail.html',
            controller: 'userProfileController'
        })
        .when('/updatePassword', {
            templateUrl: '../partials/partial.updatePassword.html',
            controller: 'userProfileController'
        })
        //Admin Routes
        .when('/admin', { //Post-Auth Admin PAge
            templateUrl: '../partials/partial.admin.html',
            controller: 'adminController'
        })
        .otherwise({
            redirectTo: '/'
        });

        // $locationProvider.html5Mode(true);
        // $locationProvider.html5Mode(true).hashPrefix('!');
});
