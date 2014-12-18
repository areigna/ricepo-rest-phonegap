// Ricepo Starter
angular.module('ricepo', ['ionic', 'ricepo.controllers', 'truncate', 'ricepo.services', 'ngCordova'])

.run(['$ionicPlatform', '$rootScope', 'restService', function($ionicPlatform, $rootScope, restService) {
  $ionicPlatform.ready(function() {
    //console.log('deviceready');
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    $ionicPlatform.on('resume', function() {
      console.log('resume');
      $rootScope.$broadcast('loadOrder');
    });
    $ionicPlatform.on('pause', function() {
      console.log('pause');
    });
    if(restService.getRestId()) {
      restService.registerPush();
    }
    $rootScope.$on('pushNotificationReceived', function() {
      $rootScope.$broadcast('loadOrder');
    });
  });

}])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

    .state('app.orderList', {
      url: "/orderList",
      templateUrl: "templates/orderList.html",
      controller: 'OrderListCtrl'
    })

    .state('app.orderDetail', {
      url: "/orderDetail/:orderId",
      templateUrl: "templates/orderDetail.html",
      controller: 'OrderDetailCtrl'
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/orderList');
});

