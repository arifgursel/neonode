// Token Handling Methods
myApp.factory('authTokenFactory', function($window){
    // a factory is nothing more than a function that returns an object literal!
    var factory = {};

    factory.getToken = function(){ return $window.localStorage.getItem('token'); }
    factory.setToken = function(token){
        if (token){ $window.localStorage.setItem('token', token); }
        else { $window.localStorage.removeItem('token'); } }

    // most important step: return the object so it can be used by the rest of our angular code
    return factory;
});

//API TokenInterceptor
myApp.factory('authInterceptorFactory', function($q, $location, authTokenFactory){

    var factory = {};

    //Add token to header of each request from local storage
    factory.request = function(config) {
        var token = authTokenFactory.getToken();
        if (token){
            config.headers['x-access-token'] = token;
        }
        return config;
    }

    //Handle Custom Error Response and Redirection
    factory.responseError = function(response){
        if (response.status == 403){
            $location.path('/login');
        }
        return $q.reject(response);
    }

    return factory;
});

// Login, Logout & Authentication
myApp.factory('authFactory', function($http, $q, authTokenFactory){

    var factory = {};
    factory.current_user = {};

     //Login:
    factory.login = function(email,password){
        return $http.post('/api/login', {email: email, pwHash: password}).then(function(response){
            console.log("Factory Login got a response of: ", response);
            if (response.data.success == true){
                authTokenFactory.setToken(response.data.token);
                factory.isLoggedIn = true;
                if(response.data.type > 0)
                    factory.isAdmin = true;
                else
                    factory.isAdmin = false;
                return response;
            } else {
                return response;
            }
       });
    }
    //Facebook Login
    // factory.fbLogin = function(){
    //     console.log("fbLogin from factory entered!");
    //     return $http.get('/api/auth/facebook').then(function(response){
    //         console.log("fbLogin from factory after response recieved:", response);
    //         if (response.data.success == true){
    //             authTokenFactory.setToken(response.data.token);
    //             factory.isLoggedIn = true;
    //             return response;
    //         } else {
    //             return response;
    //         }
    //    });
    // }
    //Logout:
    factory.logout = function(){
       authTokenFactory.setToken();
       factory.isLoggedIn = false;
       factory.admin = false;
    }
    //Authenticate
    factory.authenticate = function (){
        if(authTokenFactory.getToken())
            return true;
        else
            return false;
    }
    //Authenticate
    // factory.setFbToken = function (token){
    //     authTokenFactory.setToken(token);
    // }
    factory.setToken = function (token){
        authTokenFactory.setToken(token);
    }
    //Get Logged In User Info From Server
    factory.getCurrentUser = function(){
        if (authTokenFactory.getToken()){
            return $http.get('/api/me').then(function(response){
                factory.current_user = response.data;
                if (factory.current_user.type > 0){
                    factory.admin = true;
                } else {
                    factory.admin = false;
                }
                return factory.current_user;
            });
        } else {
            return $q.reject({message: "user has no token"});
        }
    }
    //Return current factory stored user ID
    factory.getID = function(){
        return factory.current_user.id;
    }
    factory.getAdminStatus = function(){
        if(factory.admin === undefined){
            this.getCurrentUser().then(function(response){
                return factory.admin;
            });
        } else {
            return factory.admin;
        }
    }

    return factory;
});

// User CRUD
myApp.factory('userFactory', function($http, $q, authTokenFactory){
    // factory object
    var factory = {};
    //Array of all system users
    factory.users = [];
    //Admin object for editing
    factory.user = {};

    //CRUD Methods
    //
    //Create:
    factory.create = function(newUser){
        return $http.post('/api/signup', newUser).then(function(response){
            console.log("response from users.create on server:", response);
            if (response.data.success == false){
                console.log('Factory: Error creating user, see server error!');
            } else {  //user created
                authTokenFactory.setToken(response.data.token);

            }
        });
    };
    //Read: All
    factory.getUsers = function(){
        console.log('Factory.getusers called');
        return $http.get('/api/users').then(function(response){
            if (response.data.success == false){
                console.log('Cant fetch users from DB, see server for error');
                return factory.users;
            } else {  //users returned
                console.log('Fetched users from DB... setting variables');
                factory.users = response.data.users;
                return factory.users;
            }
        })
    }
    //Read: One
    factory.getUser = function (id, callback){
       return $http.get('/api/users/'+id).then(function(response){
            console.log("response from server was:", response);
            if (response.data.success == false){
                console.log('Cant fetch user from DB, see server for error');
                return response.data.success;
            } else {  //user returned
                console.log('Factory: User Is:', response.data);
                factory.setUser(response.data);
                //callback(factory.getUser);
                return response.data;
            }
        })
    }
    //Read: One
    factory.findUser = function (email){
       return $http.get('/api/users/'+email).then(function(response){
            console.log("response from server was:", response);
            if (response.data.success == false){
                console.log('Cant find a user in DB, see server for error');
                return response.data.success;
            } else {  //user returned
                console.log('Factory | User found:', response.data);
                return response.data;
            }
        })
    }
    //Front End Validation Methods
    factory.isValidNewUser = function(user, errorArr) {
        console.log('user info being validated:',user);
        if(user.firstName && user.lastName && user.email && user.password1 && user.password2){
            //Name check
            if (user.firstName.length < 2){
                errorArr.push("First name must be longer than 2 characters...")
            }
            if (user.lastName.length < 2){
                errorArr.push("Last name must be longer than 2 characters...")
            }

            //Email Check needs to be implemented
            //var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;

            //Password check
            if (user.password1 === user.password2){
                user.password = user.password1;
            } else {
                errorArr.push("Passwords don't match...")
            }

            //return results
            if (errorArr.length == 0){
                console.log('user info is valid');
                return true;
            } else {
                console.log('user info is not valid');
                return false;
            }
        } else {
            errorArr.push("You must fill out this form completely to register");
            return false;
        }
    };
    //Read: One
    factory.deleteUser = function (id){
       return $http.delete('/api/users/'+id).then(function(response){
            console.log("response from server was:", response);
            if (response.data.success == false){
                console.log('Cant delete user from DB, see server for error');
                return response.data.success;
            } else {  //user returned
                console.log('User Deleted');
                return response.data.success;
            }
        })
    };
    //Make Admin
    factory.makeAdmin = function(id){
        return $http.post('/api/users/'+id+'/admin').then(function(response){
            console.log("response from server was:", response);
            if (response.data.success == false){
                console.log('Cant make user an admin');
                return response.data.success;
            } else {  //user returned
                console.log('User made admin');
                return response.data.success;
            }
        })
    };
    //Make Super Admin
    factory.makeSuperAdmin = function(id){
        return $http.post('/api/users/'+id+'/superadmin').then(function(response){
            console.log("response from server was:", response);
            if (response.data.success == false){
                console.log('Cant make user a super admin');
                return response.data.success;
            } else {  //user returned
                console.log('User made super admin');
                return response.data.success;
            }
        })
    };
    //Remove Admin
    factory.removeAdmin = function(id){
        return $http.post('/api/users/'+id+'/removeadmin').then(function(response){
            console.log("response from server was:", response);
            if (response.data.success == false){
                console.log('Cant remove admin');
                return response.data.success;
            } else {  //user returned
                console.log('User admin status removed');
                return response.data.success;
            }
        })
    };

    //return the factory object
    return factory;
});
myApp.factory('userProfileFactory', function($http, $q, authFactory){
    // factory object
    var factory = {};
    factory.user = {};

    //Read: One
    factory.getMe = function(id){
       return $http.get('/api/users/'+id).then(function(response){
                    factory.user = response.data;
                    return factory.user;
                });
    };
    factory.updateMe = function(user){
        user.updated_at = Date.now();
        return $http.post('/api/users/'+user._id, user).then(function(response){
            if(response.data == false){
                console.log("couldnt update user");
            } else {
                return response.data;
            }
        });
    };
    factory.updatePassword = function(user){
        console.log("Inside update password");
        user.updated_at = Date.now();
        return $http.post('/api/users/password/'+user._id, user).then(function(response){
            if(response.data == false){
                console.log("couldnt update user password");
            } else {
                return response.data;
            }
        });
    };
    //return the factory object
    return factory;
});

myApp.factory('mapFactory', function($http, $q) {
    var factory = {};

    // Selected Location (initialize to center of America)
    var selectedLat = 39.50;
    var selectedLong = -98.35;

    // Handling Clicks and location selection
    factory.clickLat  = 0;
    factory.clickLong = 0;

    factory.loadMap = function (business) {
        console.log('in loadMap!');
        var latLng = {lat: selectedLat, lng: selectedLong};
        var mapDiv = document.getElementById('map');

        // Create a popup window for this business
        var  contentString =
            '<p><b>Business</b>: ' + business.name +
            '<br><b>Description</b>: ' + business.description +
            '<br><b>Location</b>: ' + business.address + ', ' + business.city + ', ' + business.state + ' ' + business.zip +
            '</p>';
        console.log("Business: ", business);

        if (business.location) {
            console.log("Got location!", business.location);
            var location = {
                                latlon: new google.maps.LatLng(business.location[1], business.location[0]),
                                message: new google.maps.InfoWindow({
                                    content: contentString,
                                    maxWidth: 320
                                }),
                                business: business.name
                            }
        }
        else {
            console.log("No location!");
            var location = {
                                latlon: new google.maps.LatLng(selectedLat, selectedLong),
                                message: new google.maps.InfoWindow({
                                    content: contentString,
                                    maxWidth: 320
                                }),
                                business: business.name
                            }
        }

        // Create a new map and place in the index.html page
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 3,
            center: latLng
        });

        var marker = new google.maps.Marker({
            position: location.latlon,
            animation: google.maps.Animation.BOUNCE,
            map: map,
            title: "Commonwealth Map",
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        });

        // Add a listener for the business marker that checks for clicks
        google.maps.event.addListener(marker, 'click', function(e){
            // When clicked, open the selected marker's message
            currentSelectedMarker = location;
            location.message.open(map, marker);
        });

        lastMarker = marker;
    }

    factory.refresh = function (business) {
        console.log('in refresh!');
        // Refresh the page upon window load. Use the initial latitude and longitude
        google.maps.event.addDomListener(window, 'load',
            factory.loadMap(business));
    };

    return factory;
});

myApp.factory('businessFactory', function($rootScope, $http, $q){
    // factory object
    var factory = {};

    factory.addBusiness = function(businessData){
        console.log('in addBusiness!');
        var deferred = $q.defer();
        var url = 'api/businesses/create';
        return $http.post(url, businessData)
                .success(function (response) {
                    console.log("Successs: " + response);
                    return deferred.resolve(response);
                })
                .error(function (response) {
                    console.log('Error: ' + response);
                    return deferred.reject(response);
                });

        return deferred.promise;
    }

    factory.getBusinesses = function(search){
        console.log('in getBusinesses!');
        var deferred = $q.defer();
        var url = 'api/businesses';
        if (search != "")
        {
            url = 'api/businesses/search/'+ search;
        }

        return $http.get(url)
        .success(function(response) {
            return deferred.resolve(response);
        })
        .error(function(response) {
            return deferred.reject(response);
        });

        return deferred.promise;
    };

    factory.getBusiness = function(businessId){
        console.log('in getBusiness');
        var deferred = $q.defer();

        return $http.get('/api/businesses/' + businessId)
        .success(function(response) {
            //refresh(selectedLat, selectedLong);
            return deferred.resolve(response);
        })
        .error(function(response) {
            return deferred.reject(response);
        });

        return deferred.promise;
    };

    factory.addReview = function(reviewData){
        console.log('in addReview!');
        var deferred = $q.defer();
        var url = 'api/reviews/create';
        return $http.post(url, reviewData)
                .success(function (response) {
                    console.log("Successs: " + response);
                    return deferred.resolve(response);
                })
                .error(function (response) {
                    console.log('Error: ' + response);
                    return deferred.reject(response);
                });

        return deferred.promise;
    };

    factory.addBusinessCategory = function(categoryData){
        console.log('in addCategory!');
        var deferred = $q.defer();
        var url = 'api/categories/create';
        return $http.post(url, categoryData)
                .success(function (response) {
                    console.log("Successs: " + response);
                    return deferred.resolve(response);
                })
                .error(function (response) {
                    console.log('Error: ' + response);
                    return deferred.reject(response);
                });

        return deferred.promise;
    };

    factory.getBusinessCategories = function() {
        console.log('in getCategories!');
        var deferred = $q.defer();
        var url = 'api/categories';

        return $http.get(url)
        .success(function(response) {
            return deferred.resolve(response);
        })
        .error(function(response) {
            return deferred.reject(response);
        });

        return deferred.promise;
    };

    //return the factory object
    return factory;
});
