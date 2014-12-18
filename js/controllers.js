angular.module('ricepo.controllers', [])

.controller('AppCtrl', ['$scope', '$rootScope', '$ionicModal', '$ionicLoading', 'restService', function($scope, $rootScope, $ionicModal, $ionicLoading, restService) {
  $scope.loginData = {};
  $scope.restOptions = [];
  $scope.cityOptions = [
    'rochester,ny',
    'bloomington,in',
    'columbus,oh'
  ];

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
    if(!restService.getRestId()) {
      $scope.modal.show();
    }
  });

  $scope.updateRest = function() {
    $ionicLoading.show();
    restService.getRestsByCity($scope.loginData.city)
      .then(function(restsData) {
        $scope.restOptions = restsData.data.Items;
      })
      .finally($ionicLoading.hide);
  };

  $scope.$watch('loginData.password', function(newValue, oldValue){
    var rest = $scope.loginData.rest;
    if(!rest || !newValue) return;
    if(newValue === rest.password) {
      restService.setRestId(rest.rest_id);
      $rootScope.$broadcast('loadOrder');
      $scope.closeLogin();
      restService.registerPush();
    }
  });

  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  $scope.openLogin = function() {
    $scope.loginData.password = '';
    $scope.modal.show();
  };

}])

//order list controller
.controller('OrderListCtrl', ['$scope', '$ionicLoading', 'orderService' , 'restService', function($scope, $ionicLoading, orderService, restService) {
  $scope.orders = [];
  $scope.load = function(pullRefresh) {
    if(!restService.getRestId()) return;
    if(pullRefresh !== true) {
      $ionicLoading.show();
    }
    orderService.getOrderList(restService.getRestId())
      .then(function (orders) {
        $scope.orders = orders.Items;
      })
      .finally(function(){
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });

  };

  $scope.$on('loadOrder', $scope.load);
  $scope.load();
}])

.controller('OrderDetailCtrl', ['$scope', '$stateParams', '$ionicPopup', '$state', 'orderService' , 'restService', '$ionicLoading', '$ionicNavBarDelegate', function($scope, $stateParams,$ionicPopup, $state, orderService, restService, $ionicLoading, $ionicNavBarDelegate) {

  $scope.rest_id = restService.getRestId();
  $scope.order_id = $stateParams.orderId;
  $scope.order = {};
  $scope.confirmData = {};

  $scope.load = function() {
    $ionicLoading.show();
    orderService.getOrderDetail($scope.rest_id, $scope.order_id)
      .then(function(order) {
        var index, length;
        
        // convert items into object
        for(index = order.items.length -1; index >=0; index -= 1) {
          try {
            order.items[index] = JSON.parse(order.items[index]);
          } catch (ex) {}
        }
        // add order subTotal
        order.subtotal = order.total;
        order.total = order.subtotal + order.tax + order.fee;
        // format phone number in usa style
        order.phone = order.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
        $scope.order = order;
        $scope.init();
      })
      .finally($ionicLoading.hide);
  };

  //initilized the options first
  $scope.init = function() {
    $scope.timeOptions = [];
    for(var i = 5; i < 80 ; i+=5) {
      $scope.timeOptions.push(i + ' min');
    }

    $scope.confirmData.time = $scope.order.delay;
    if($scope.order.delay === 'now') {
      $scope.confirmData.time = restService.get('time');
      $scope.$watch('confirmData.time', function(newValue) {
        if(newValue) {
          restService.set('time', newValue)
        }
      });
    }
  }

  $scope.showConfirm = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Confirm order',
      subTitle: 'Estimate ' + $scope.confirmData.time + '?'
    });
    confirmPopup.then(function(res) {
      if(res) {
        $scope.updateOrder('Confirmed', 'Estimate ' + $scope.confirmData.time);
      }
    });
  }; 

  $scope.showCancel = function() {

    var reason = $scope.confirmData.reason || 'Canceled by restaurant';
    var myPopup = $ionicPopup.confirm({
      title: 'Cancel order',
      subTitle: reason
    });
    myPopup.then(function(res) {
      if (res) {
        $scope.updateOrder('Cancelled', reason);
      } 
    });
  };

  $scope.updateOrder = function(status, msg) {
    $ionicLoading.show();
    orderService.updateOrder($scope.rest_id, $scope.order_id, status, msg)
      .success(function() {
        $ionicNavBarDelegate.back();
      })
      .error(function() {
        $ionicPopup.alert({
          title: 'Please try again..'
        }).then(function() {
          $ionicNavBarDelegate.back();
        });
      })
      .finally($ionicLoading.hide);
  };

  $scope.load() ;
  
}]);
