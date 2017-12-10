// myApp.controller('navController', function($location, $scope, $rootScope, $modal, $log, authFactory){
//     $scope.$on('userLoggedIn', function(){
//         //Code to apply modification to your menu
//         $scope.init();
//     });
//
//     //Init Method
//     $scope.init = function() {
//         //Check logged in status
//         authFactory.getCurrentUser().then(function(response){
//             $scope.loggedIn = authFactory.authenticate();
//             $scope.admin = authFactory.getAdminStatus();
//             console.log("nav controller loaded | Login Status:",$scope.loggedIn+" | Admin:", $scope.admin);
//         });
//
//     };
//     //Ctrl Execution
//     $scope.init();
// });
// myApp.controller('modalController', function($location, $scope, $rootScope, $modal, $log, authFactory){
//   $scope.open = function (size, backdrop, itemCount, closeOnClick) {
//
//      $scope.items = [];
//
//      var count = itemCount || 3;
//
//      for(var i = 0; i < count; i++){
//          $scope.items.push('item ' + i);
//      }
//
//      var params = {
//          templateUrl: 'myModalContent.html',
//          resolve: {
//              items: function() {
//                  return $scope.items;
//              },
//          },
//          controller: function($scope, $modalInstance, items) {
//
//              $scope.items = items;
//              $scope.selected = {
//                  item: $scope.items[0],
//              };
//
//              $scope.reposition = function() {
//                  $modalInstance.reposition();
//              };
//
//              $scope.ok = function() {
//                  $modalInstance.close($scope.selected.item);
//              };
//
//              $scope.cancel = function() {
//                  $modalInstance.dismiss('cancel');
//              };
//
//              $scope.openNested = function() {
//                  open();
//              };
//          }
//      };
//
//      if(angular.isDefined(closeOnClick)){
//          params.closeOnClick = closeOnClick;
//      }
//
//      if(angular.isDefined(size)){
//          params.size = size;
//      }
//
//      if(angular.isDefined(backdrop)){
//          params.backdrop = backdrop;
//      }
//
//      var modalInstance = $modal.open(params);
//
//      modalInstance.result.then(function(selectedItem) {
//          $scope.selected = selectedItem;
//      }, function() {
//          $log.info('Modal dismissed at: ' + new Date());
//      });
//  };
myApp.controller('authController', function($location, $scope, $rootScope, $modal, $log, authFactory, userFactory){
    //User signup
    $scope.createUser = function(){
        //empty errors array
        $scope.errors = [];
        //Check if valid (pass object and errror array)
        if(userFactory.isValidNewUser($scope.newUser,$scope.errors)){
            userFactory.create($scope.newUser).then(function(){
                $rootScope.$broadcast('userLoggedIn');
                $location.path('/home');
            });
        } else {
            console.log("Not a valid user, not added to DB")
        }
    };
    //User Site Access
    $scope.login = function(){
        $scope.processing = true;
        $scope.error = '';
        authFactory.login($scope.user.email, $scope.user.password).then(function(response){
            $scope.processing = false;
            console.log("Controller Login got a response of:",response);
            if(response.data.success == false){
                $scope.error = response.data.message;
            } else {
                authFactory.getCurrentUser().then(function(response){
                    console.log("Controller getCurrentUser got a response of:",response);
                    $scope.user = response;
                    if($scope.user.type >= 0){
                        $rootScope.$broadcast('userLoggedIn');
                        console.log("switching to home route");
                        $location.path('/home');
                    } else {
                        $scope.error = response.data.message;
                    }
                });
            }
        });
    };
    $scope.fbLogin = function(){
        console.log("fbLogin from controller entered!");
        $scope.processing = true;
        authFactory.fbLogin().then(function(response){
            console.log("fbLogin from controller after response recieved:", response);
            $scope.processing = false;
            authFactory.getCurrentUser().then(function(response){
                $scope.user = response.data
            });
            if (response.data.success){
                $rootScope.$broadcast('userLoggedIn');
                $location.path('/home');
            } else {
                $scope.error = response.data.message;
            }
        });
    };
    $scope.logout = function(){
        authFactory.logout();
        $scope.loggedIn = false;
        $scope.admin = false;
        $scope.init();
        $location.path('/welcome');
    };
    $scope.openSignup = function (size, backdrop, itemCount, closeOnClick) {

       $scope.items = [];

       var count = itemCount || 3;

       for(var i = 0; i < count; i++){
           $scope.items.push('item ' + i);
       }

       var params = {
           templateUrl: 'signupContent.html',
           resolve: {
               items: function() {
                   return $scope.items;
               },
           },
           controller: function($scope, $modalInstance, items) {

               $scope.items = items;
               $scope.selected = {
                   item: $scope.items[0],
               };

               $scope.reposition = function() {
                   $modalInstance.reposition();
               };

               $scope.ok = function() {
                   $modalInstance.close($scope.selected.item);
               };

               $scope.cancel = function() {
                   $modalInstance.dismiss('cancel');
               };

               $scope.openNested = function() {
                   open();
               };
               $scope.swap = function(cb) {
                   $modalInstance.dismiss('cancel');
                   cb();
               };
           }
       };

       if(angular.isDefined(closeOnClick)){
           params.closeOnClick = closeOnClick;
       }

       if(angular.isDefined(size)){
           params.size = size;
       }

       if(angular.isDefined(backdrop)){
           params.backdrop = backdrop;
       }

       var modalInstance = $modal.open(params);

       modalInstance.result.then(function(selectedItem) {
           $scope.selected = selectedItem;
       }, function() {
           $log.info('Modal dismissed at: ' + new Date());
          }
       );
    };
    $scope.openLogin = function (size, backdrop, itemCount, closeOnClick) {
       $scope.items = [];

       var count = itemCount || 3;

       for(var i = 0; i < count; i++){
           $scope.items.push('item ' + i);
       }

       var params = {
           templateUrl: 'loginContent.html',
           resolve: {
               items: function() {
                   return $scope.items;
               },
           },
           controller: function($scope, $modalInstance, items) {

               $scope.items = items;
               $scope.selected = {
                   item: $scope.items[0],
               };

               $scope.reposition = function() {
                   $modalInstance.reposition();
               };

               $scope.ok = function() {
                   $modalInstance.close($scope.selected.item);
               };

               $scope.cancel = function() {
                   $modalInstance.dismiss('cancel');
               };

               $scope.openNested = function() {
                   open();
               };
               $scope.swap = function(cb) {
                   $modalInstance.dismiss('cancel');
                   cb();
               };
           }
       };

       if(angular.isDefined(closeOnClick)){
           params.closeOnClick = closeOnClick;
       }

       if(angular.isDefined(size)){
           params.size = size;
       }

       if(angular.isDefined(backdrop)){
           params.backdrop = backdrop;
       }

       var modalInstance = $modal.open(params);

       modalInstance.result.then(function(selectedItem) {
           $scope.selected = selectedItem;
       }, function() {
           $log.info('Modal dismissed at: ' + new Date());
          }
       );
    };

    //Init Method
    $scope.init = function () {
        //Check logged in status
        console.log("authCtrl initializing...");
        $scope.loggedIn = authFactory.authenticate();
        if($scope.loggedIn){ //user logged in
            //Set current user
            authFactory.getCurrentUser().then(function(user){
                $scope.current_user = user;
                $scope.admin = authFactory.getAdminStatus();
                //Get date
                $scope.today = Date.now();
                console.log("nav controller loaded | Login Status:",$scope.loggedIn+" | Admin:", $scope.admin+" current user is: ", JSON.stringify($scope.current_user));
            });
        } else { //user not logged in
            //Empty newUser object
            $scope.newUser = $scope.registering_user || {};

        }
    };
    //Ctrl Execution
    $scope.init();
});
myApp.controller('userProfileController', function($location, $scope, authFactory, userProfileFactory){
    //Updates:
    $scope.updateUser = function(user){
        userProfileFactory.updateMe(user).then(function(response){
            if(response == false){

            } else {
                $scope.user = response;
                $location.path('/profile');
            }
        });
    };
    $scope.updateEmail = function(user){
        console.log("inside updateEmail");
        if ($scope.user.oldEmail && $scope.user.newEmail === $scope.user.newEmail2){
            console.log("Passed front end validation with:",JSON.stringify($scope.user.oldEmail), JSON.stringify($scope.user.newEmail), JSON.stringify($scope.user.newEmail2));
            user.email = $scope.user.newEmail;
            $scope.updateUser(user);
        } else {
            console.log("Didn't pass front end validation with:",JSON.stringify($scope.user.oldEmail), JSON.stringify($scope.user.newEmail), JSON.stringify($scope.user.newEmail2));
        }
    };
    $scope.updatePassword = function(user){
        if ($scope.user.oldPass && $scope.user.newPass === $scope.user.newPass2){
            userProfileFactory.updatePassword(user).then(function(response){
                if(response == false){

                } else {
                    $scope.user = response;
                    $location.path('/profile');
                }
            });
        } else {
            console.log("Didn't pass front end validation with:",JSON.stringify($scope.user.oldPass), JSON.stringify($scope.user.newPass), JSON.stringify($scope.user.newPass2));
        }
    };
    //Init Methods
    $scope.init = function () {
        //Check logged in status
        $scope.loggedIn = authFactory.authenticate();
        if($scope.loggedIn){ //user logged in
            //Set current user
            authFactory.getCurrentUser().then(function(response){
                userProfileFactory.getMe(response.id).then(function(response){
                    $scope.user = response;
                    // console.log("userProfileController loaded for user:", JSON.stringify($scope.user));
                });
            });
        } else { //user not logged in
            $location.path('/login');
        }
    };
    $scope.init();
});
myApp.controller('welcomeController', function($location, $scope, $rootScope, authFactory){
    //Init Methods
    $scope.init = function() {
        //Check and Set current user
        console.log("welcomeCtrl loaded");
    };
    //Ctrl Execution
    $scope.init();
});
myApp.controller('homeController', function($routeParams, $location, $scope, $rootScope, authFactory, authTokenFactory){
    //Init Methods
    $scope.init = function () {
        console.log("token value from url is: "+token);
        authFactory.setToken(getAllUrlParams().token);
        $rootScope.$broadcast('userLoggedIn');
        $location.path('/home');
      // } else {
      //     if(authFactory.authenticate() == true){
      //       $rootScope.$broadcast('userLoggedIn');
      //       console.log("homeCtrl checked user auth and it passed");
      //       $location.path('/home');
      //     } else {
      //         $location.path('/welcome');
      //     }
      // }
    };
    //Ctrl Execution
    console.log("Inside the home controller");
    var params = $routeParams;
    console.log("params:",params);
    $scope.init();
});



myApp.controller('adminController', function($location, $scope, authFactory, userFactory){
    $scope.users = [];
    $scope.user = {};

    //Delete
    $scope.deleteUser = function(id){
        userFactory.deleteUser(id).then(function(response){
            $scope.init();
        });
    };

    //Admin
    $scope.makeAdmin = function(id){
        userFactory.makeAdmin(id).then(function(response){
            $scope.init();
        });
    };

    //Super Admin
    $scope.makeSuperAdmin = function(id){
        userFactory.makeSuperAdmin(id).then(function(response){
            $scope.init();
        });
    };

    //Remove Admin
    $scope.removeAdmin = function(id){
        userFactory.removeAdmin(id).then(function(response){
            $scope.init();
        });
    };

    //Read: One User
    $scope.getUser = function(id){
        userFactory.getUser().then(function(response){
            $scope.user = response;
            console.log("Got user back from the server!");
        });
    };
    //Init Methods
    $scope.init = function () {
        //Check logged in status
        $scope.loggedIn = authFactory.authenticate();
        if($scope.loggedIn){ //user logged in
            if(authFactory.getAdminStatus()){
                userFactory.getUsers().then(function(response){
                    $scope.users = response;
                    console.log("Got users back from the server:", $scope.users);
                    console.log("Admin controller loaded");
                });
            } else {
                console.log("Failed admin check");
                $location.path('/home');
            }
        } else {
            $location.path('/welcome');
        }
    };
    //Ctrl Execution
    $scope.init();
});
