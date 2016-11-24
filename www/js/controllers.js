angular.module('starter.controllers', [])

  .controller('AppCtrl', function($scope, $ionicModal, $timeout) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    /*$ionicModal.fromTemplateUrl('templates/about.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalLogin = modal;
    });*/

    // Triggered in the login modal to close it
   /* $scope.closeModalLogin = function() {
      $scope.modalLogin.hide();
    };*/


    $scope.loaderInit = function(elm) {
      elm.classList.add('visible');
    };
    $scope.loaderRemove = function(elm) {
      elm.classList.remove('visible');
    };

    // Open the login modal
    $scope.openModal = function() {
      $scope.modalLogin.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function() {
        $scope.closeModal();
      }, 1000);
    };
  })

  .controller('AboutCtrl', function($scope) {
    $scope.playlists = [
      { title: 'Reggae', id: 1 },
      { title: 'Chill', id: 2 },
      { title: 'Dubstep', id: 3 },
      { title: 'Indie', id: 4 },
      { title: 'Rap', id: 5 },
      { title: 'Cowbell', id: 6 }
    ];
  })

  .factory('PollutionService' , function ($http) {

    var APIpollution = {};
    APIpollution.getInfo = function(selectCity , successCallback , errorCallback) {
      return $http.get('https://api.breezometer.com/baqi/?location='+selectCity+'&key=84a75c0b1f9c4d219def51b57dcd0894').then(successCallback, errorCallback);
    };
    return APIpollution;

  })

  .factory('GeoService' , function ($http) {
    var Location = {};
    Location.getInfo = function(selectCity , successCallback , errorCallback) {
      return $http.get('http://maps.googleapis.com/maps/api/geocode/json?address='+selectCity+'&sensor=true').then(successCallback, errorCallback);
    };

    return Location;

  })

  .controller('PollutionCtrl' , function ($scope, PollutionService, GeoService , $ionicModal ) {
    function mapInitialState($scope) {
      $scope.error = '';
      $scope.errorDisplayMode = 'none';
      $scope.containerBackground = '#ffffff';
  }
    $scope.selectCity = document.querySelector('[data-search=input]');
    $scope.loader = document.querySelector('[data-breeze=overlay]');
    mapInitialState($scope);
    $scope.closeModalMap = function () {
      $scope.modalMap.remove();
      mapInitialState($scope);
    };


    $scope.initMap = function ($scope) {
      $scope.location = $scope.selectCity.value;
      var successBreeze = function(response) {
        if( response.data.hasOwnProperty(['error'])) {
          $scope.error = response.data.error.message;
          $scope.errorDisplayMode = 'block';

        } else {
          $scope.containerBackground = response.data.breezometer_color;

          $scope.breezoCountry = response.data.country_name;
          $scope.countryBackground = response.data.country_color;

          $scope.dominantPollutant = response.data.dominant_pollutant_text.main;
          $scope.pollutionEffects = response.data.dominant_pollutant_text.effects;
          $scope.pollutionSources = response.data.dominant_pollutant_text.causes;

          $scope.pollutionInfoChildren = response.data.random_recommendations.children;
          $scope.pollutionInfoHealth = response.data.random_recommendations.health;
          $scope.pollutionInfoOutside = response.data.random_recommendations.outside;
          $scope.pollutionInfoInside = response.data.random_recommendations.inside;
          $scope.pollutionInfoSports = response.data.random_recommendations.sport;
        }
        $scope.loaderRemove($scope.loader);
      };
      var errorBreeze = function() {
        $scope.loaderRemove($scope.loader);
      };

      var successMap = function (response) {
        if (response.data.results.length > 0) {
          var location = response.data.results[0],
            mapContainer = document.querySelector('[data-map=true]'),
            map;
          map = new google.maps.Map(mapContainer, {
            center: {lat: location.geometry.location.lat, lng: location.geometry.location.lng},
            zoom: 3
          });
          PollutionService.getInfo($scope.location , successBreeze , errorBreeze);
        } else {
          $scope.error = 'No such city exists.';
          $scope.errorDisplayMode = 'block';
          $scope.loaderRemove($scope.loader);
        }
      };

      var errorMap = function (data) {
        console.log(data)
        $scope.loaderRemove($scope.loader);
      };


      $ionicModal.fromTemplateUrl('templates/map.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modalMap = modal;
        $scope.modalMap.show().then(function () {
          try {
            GeoService.getInfo($scope.location , successMap , errorMap);
          } catch(error) {
            console.log(error)
          }
        });
      });

    };

    $scope.changeCity = function() {
      if ($scope.selectCity.value === '') {
        return;
      }

      $scope.loaderInit($scope.loader);
      $scope.initMap($scope);
    };


  });
