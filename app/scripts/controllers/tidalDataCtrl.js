'use strict';

angular.module('grapheneTidalApp')
  .controller('sgTidalDataCtrl', function($scope, $http, $window) {

    $scope.callWindowFunction = function(f) {
      if (_.isFunction($window[f])) {
        $window[f]();
      }
    };

    $scope.$watch('jsonUrl', function(newVal) {
      if (newVal) {
        $http.get($scope.jsonUrl).success(function(data) {
          $scope.data = data;
          $window.copy = angular.copy(data);
        });
      }
    });
    $scope.$watch('json', function(newVal) {
      if (newVal) {
        $scope.data = $scope.json;
      }
    });

    var urlify = function(content) {
      var blob = new Blob([content], {
        type: 'text/plain'
      });
      return (window.URL || window.webkitURL).createObjectURL(blob);
    };
    $scope.svgToUrl = function() {
      var svg = $window.document.querySelector('svg');
      var x = new XMLSerializer();
      $scope.svgUrl = urlify(x.serializeToString(svg));
    };


    $scope.loadGene = function() {
      $scope.exports.geneData = {
        'STAT5A': {
          'sources': [
            'CEBPG',
            'ETS2',
            'IRF1',
            'NFE2L1',
            'SOX15',
            'ZEB1'
          ],
          'group': '\t4 hours',
          'targets': [
            'ALX1',
            'FOSL1'
          ]
        }
      };
    };

    // Timeout to let forceLayout function to be available
    //
    $scope.$watch('data', function(newVal) {
      if (newVal) {
        $scope.exports = {
          data: $scope.data,
          charge: $scope.charge,
          linkDistance: $scope.linkDistance,
          subgraph: $scope.subgraph,
          nodeSize: $scope.nodeSize
        };
      }
    });

  });
