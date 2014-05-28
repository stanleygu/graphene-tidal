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

    var OPACITY = {
      focused: 1,
      unfocused: 0.1,
      normal: 0.6
    };

    var clickNode = function(node) {
      console.log('Clicked on ' + node.name);
    };

    var dblClickNode = function(node) {
      console.log('Double clicked on ' + node.name);
    };

    var mouseoverNode = function(node, $scope, $event) {

      var el = $event.target;
      console.log('mousing over', el);

      node.opacity = OPACITY.focused;
      _.each($scope.imports.nodes, function(n) {
        if (n.id !== node.id) {
          n.opacity = OPACITY.unfocused;
        }
      });

      _.each($scope.imports.edges, function(edge) {
        if (edge.source.id !== node.id && edge.target.id !== node.id) {
          edge.opacity = OPACITY.unfocused;
        } else {
          edge.opacity = OPACITY.focused;
          edge.target.opacity = OPACITY.focused;
          edge.source.opacity = OPACITY.focused;
        }
      });
    };

    var mouseleaveNode = function(node, $scope) {
      _.each($scope.imports.groups, function(g) {
        _.each(g.nodes, function(n) {
          n.opacity = OPACITY.normal;
        });
      });
      _.each($scope.imports.edges, function(edge) {
        edge.opacity = OPACITY.normal;
      });
    };

    $scope.events = {
      click: clickNode,
      dblClick: dblClickNode,
      mouseover: mouseoverNode,
      mouseleave: mouseleaveNode
    };
  });
