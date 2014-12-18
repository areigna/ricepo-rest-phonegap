angular.module('ricepo.services', [])

  .constant('domain','http://ricepo.com:8080')
  .constant('androidConfig', {
    senderID: '126285366160'
  })
  .constant('iosConfig', {
    "badge":"true",
    "sound":"true",
    "alert":"true"
  })
  .factory('restService', ['$http', '$cordovaDevice', 'domain' , 'androidConfig', 'iosConfig', '$cordovaPush', '$cordovaDevice', function ($http, $cordovaDevice, domain, androidConfig, iosConfig, $cordovaPush, $cordovaDevice) {
    var restService = {
      getRestsByCity : function (city) {
        return $http.get(domain + '/getRestsByCity?city=' + city);
      },
      getRestId: function() {
        return localStorage.getItem('restId');
      },
      setRestId: function(id) {
        localStorage.setItem('restId', id);
      },
      get: function(key) {
        return localStorage.getItem(key);
      },
      set: function(key, value) {
        localStorage.setItem(key, value);
      },
      getPlatform: function() {
        return $cordovaDevice.getPlatform();
      },
      saveToken: function(token) {
        if(this.getRestId()) {
          return $http.get(domain + '/addApn', {
            params: {
              rest_id: this.getRestId(),
              apn: token
            }
          })
        }
      },
      registerPush : function() {
        var me = this,
            config = androidConfig;
        if(this.getPlatform().toLowerCase() === 'ios') {
          config = iosConfig;
        }
        $cordovaPush.register(config).then(function(token) {
          //console.log(token);
          me.saveToken(token);
        }, function(err) {
          console.log(err);
        });
      }
    }
    return restService;
  }])

  .factory('orderService', ['$http', 'domain' , function ($http, domain) {
    var orderService = {
      getOrderList : function (rest_id) {
        var promise = $http.get(domain + '/order/' + rest_id).then(function (response) {
          return response.data;
        });

        return promise;
      },

      getOrderDetail: function (rest_id, id) {
        var promise = $http.get(domain + '/order/' + rest_id + '/' + id).then(function (response) {
          return response.data.Items[0];
        });

        return promise;
      },

      updateOrder: function(rest_id, order_id, status, msg) {
        return $http.get(domain + '/updateOrder', {
          params: {
            rest_id: rest_id,
            order_id: order_id,
            status: status,
            msg: msg
          }
        });
      }
    }

    return orderService;
  }]);
