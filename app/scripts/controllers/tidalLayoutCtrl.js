'use strict';

angular.module('grapheneTidalApp')
  .controller('sgTidalLayoutCtrl', function($scope, sgGeo) {

    $scope.scale = 1;
    $scope.spacer = 10;
    $scope.OPACITY = {
      focused: 1,
      unfocused: 0.1,
      normal: 1
    };


    // COMPUTED LINK PROPERTY
    var updateLinkPosition = function(link) {
      var targetToSource = sgGeo.getLineIntersectionWithRectangle({
        x1: link.source.x,
        y1: link.source.y + link.source.group * $scope.imports.subgraph.height,
        x2: link.target.x,
        y2: link.target.y + link.target.group * $scope.imports.subgraph.height
      }, {
        x1: link.source.x - (link.source.width / 2 + $scope.spacer),
        y1: link.source.y - (link.source.height / 2 + $scope.spacer) + link.source.group * $scope.imports.subgraph.height,
        x2: link.source.x + link.source.width / 2 + $scope.spacer,
        y2: link.source.y + link.source.height / 2 + $scope.spacer + link.source.group * $scope.imports.subgraph.height
      });
      var sourceToTarget = sgGeo.getLineIntersectionWithRectangle({
        x1: link.source.x,
        y1: link.source.y + link.source.group * $scope.imports.subgraph.height,
        x2: link.target.x,
        y2: link.target.y + link.target.group * $scope.imports.subgraph.height
      }, {
        x1: link.target.x - (link.target.width / 2 + $scope.spacer),
        y1: link.target.y - (link.target.height / 2 + $scope.spacer) + link.target.group * $scope.imports.subgraph.height,
        x2: link.target.x + link.target.width / 2 + $scope.spacer,
        y2: link.target.y + link.target.height / 2 + $scope.spacer + link.target.group * $scope.imports.subgraph.height
      });

      link.x1 = targetToSource.x;
      link.y1 = targetToSource.y;
      link.x2 = sourceToTarget.x;
      link.y2 = sourceToTarget.y;
    };

    $scope.$watchCollection('imports.edges', function(val) {
      if (val) {
        $scope.links = $scope.imports.edges;
        _.each($scope.links, function(l) {
          $scope.$watch(function() {
            return l.source.x + l.source.y + l.target.x + l.target.y;
          }, function() {
            updateLinkPosition(l);
          });
          updateLinkPosition(l);
        });
      }
    });

    $scope.arrow = d3.svg.symbol().size(function(d) {
      return d.size;
    }).type(function(d) {
      return d.type;
    });



    $scope.mouseoverNode = function(node) {
      var OPAC = $scope.OPACITY;
      _.each($scope.imports.edges, function(e) {
        e.opacity = OPAC.unfocused;
      });
      _.each($scope.imports.nodes, function(n) {
        n.opacity = OPAC.unfocused;
      });
      node.opacity = OPAC.focused;
      _.each(node.from, function(e) {
        e.opacity = OPAC.focused;
        e.target.opacity = OPAC.focused;
      });
      _.each(node.to, function(e) {
        e.opacity = OPAC.focused;
        e.source.opacity = OPAC.focused;
      });
    };

    $scope.mouseleaveNode = function() {
      var OPAC = $scope.OPACITY;
      _.each($scope.imports.nodes, function(n) {
        n.opacity = OPAC.normal;
      });
      _.each($scope.imports.edges, function(e) {
        e.opacity = OPAC.normal;
      });
    };

  });
