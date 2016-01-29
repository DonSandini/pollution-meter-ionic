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
      return $http.get('https://api.breezometer.com/baqi/?location='+selectCity+'&key=7d47bdacd8f147f8bee081b7f3728fa9').then(successCallback, errorCallback);
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
    //$scope.mapsAPI = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBNtbs3EtgleOH_pnrpUx6KPJLeKf4YzPM';
    $scope.selectCity = document.querySelector('[data-search=input]');
    $scope.loader = document.querySelector('[data-breeze=overlay]');
    $scope.header = 'This is a header';
    $scope.closeModalMap = function () {
      $scope.modalMap.remove()
    };


    $scope.initMap = function ($scope) {
      $scope.location = $scope.selectCity.value;
      var successBreeze = function(response) {
        //debugger;
        var elmBreezeError = document.querySelector('[data-breeze=error]'),
          elmBreezeContainer = document.querySelector('[data-breeze=container]'),
          elmBreezeCountry = document.querySelector('[data-breeze=country]'),
          elmBreezeCountryClr = document.querySelector('[data-breeze=country-clr]'),
          elmBreezePollutant = document.querySelector('[data-breeze=pollutant-main]'),
          elmBreezePollutantE = document.querySelector('[data-breeze=pollutant-effects]'),
          elmBreezePollutantC = document.querySelector('[data-breeze=pollutant-causes]');
        if( response.data.hasOwnProperty(['error'])) {
          elmBreezeError.innerHTML = response.data.error.message;
          elmBreezeError.style.display = 'block';
        } else {
          elmBreezeContainer.style.backgroundColor = response.data.breezometer_color;
          elmBreezeCountry.innerHTML = response.data.country_name;
          elmBreezeCountryClr.style.background = response.data.country_color;
          elmBreezePollutant.innerHTML = response.data.dominant_pollutant_text.main;
          elmBreezePollutantE.innerHTML = response.data.dominant_pollutant_text.effects;
          elmBreezePollutantC.innerHTML = response.data.dominant_pollutant_text.causes;
        }
        $scope.loaderRemove($scope.loader);
      };
      var errorBreeze = function(response) {
        $scope.loaderRemove($scope.loader);
      };

      var successMap = function (response) {
        var location = response.data.results[0],
          mapContainer = document.querySelector('[data-map=true]'),
          map;
        map = new google.maps.Map(mapContainer, {
          center: {lat: location.geometry.location.lat, lng: location.geometry.location.lng},
          zoom: 12
        });
        PollutionService.getInfo($scope.location , successBreeze , errorBreeze);
      };

      var errorMap = function (data) {
        debugger;
        $scope.loaderRemove($scope.loader);
      };


      $ionicModal.fromTemplateUrl('templates/map.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modalMap = modal;
        $scope.modalMap.show().then(function () {
          GeoService.getInfo($scope.location , successMap , errorMap);
        });
      });

    };

    $scope.changeCity = function() {
      $scope.loaderInit($scope.loader);
      $scope.initMap($scope);
    };


  });
