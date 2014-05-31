'use strict';

angular.module('grapheneTidalApp')
  .controller('MainCtrl', function($scope, $window) {

    $window.myCb = function() {
      console.log('layout complete');
    };
    $scope.nodeSize = {
      min: {
        width: 80,
        height: 30
      },
      max: {
        width: 160,
        height: 60
      }
    };
    $scope.subgraph = {
      height: 200,
      width: 800
    };
    $scope.layoutComplete = 'myCb';
    $scope.charge = -1200;
    $scope.jsonUrl = 'sampleJSONwithProps.json';
    $scope.linkDistance = 80;

  });
