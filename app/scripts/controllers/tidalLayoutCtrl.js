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

    var runLayout = function(data) {
      $scope.edges = _.map(data.edges, function(edge) {
        return {
          source: _.find(data.nodes, function(n) {
            return n.id === edge.nodes[0];
          }),
          target: _.find(data.nodes, function(n) {
            return n.id === edge.nodes[1];
          }),
          type: edge.type
        };
      });
      $scope.nodes = data.nodes;

      var sections = data.timeSlots;

      var orderedKeys = _.keys(sections).sort(function(a, b) {
        var reA = /[^a-zA-Z]/g;
        var reN = /[^0-9]/g;
        var aA = a.replace(reA, '');
        var bA = b.replace(reA, '');
        if (aA === bA) {
          var aN = parseInt(a.replace(reN, ''), 10);
          var bN = parseInt(b.replace(reN, ''), 10);
          return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
          return aA > bA ? 1 : -1;
        }
      });

      var sizes = {};
      sizes.max = _.max(data.nodes, function(n) {
        return n.size;
      });
      sizes.min = _.min(data.nodes, function(n) {
        return n.size;
      });
      $scope.groups = [];
      var count = 0;
      var layoutCompleteCount = 0;
      _.each(orderedKeys, function(key) {
        var sect = sections[key];
        var nodes = _.filter(data.nodes, function(n) {
          return _.contains(sect, n.id);
        });
        _.each(nodes, function(n) {
          n.group = count;
          n.scaleFactor = (n.size - sizes.min.size) / (sizes.max.size - sizes.min.size);
          n.width = $scope.imports.nodeSize.min.width +
            (($scope.imports.nodeSize.max.width - $scope.imports.nodeSize.min.width) *
            n.scaleFactor);
          n.height = $scope.imports.nodeSize.min.height +
            (($scope.imports.nodeSize.max.height - $scope.imports.nodeSize.min.height) *
            n.scaleFactor);
        });

        var links = _.filter($scope.edges, function(l) {
          return _.contains(sect, l.source.id) && _.contains(sect, l.target.id);
        });

        var force = d3.layout.force()
          .charge($scope.imports.charge || -700)
          .linkDistance($scope.imports.linkDistance || 40)
          .gravity($scope.imports.gravity || 0.1)
          .size([$scope.imports.subgraph.width || 800, $scope.imports.subgraph.height || 800]);
        _.each(nodes, function(n) {
          n.force = force;
        });
        var ran = false;
        force
          .nodes(nodes)
          .on('tick', function() {
            if ($scope.imports.subgraph.height && $scope.imports.subgraph.width) {
              _.each(force.nodes(), function(n) {
                n.x = Math.max(n.width, Math.min($scope.imports.subgraph.width -
                  n.width, n.x));
                n.y = Math.max(n.height, Math.min($scope.imports.subgraph.height -
                  n.height, n.y));
              });
              if (!ran) {
                $scope.$digest();
                ran = true;
              }
            }
            var thres = $scope.layoutStopThreshold || 0.01;
            if (force.alpha() <= thres) {
              force.stop();
              $scope.$digest();
              if ($scope.layoutComplete) {
                layoutCompleteCount += 1;
                if (layoutCompleteCount === $scope.groups.length) {
                  $scope.callWindowFunction($scope.layoutComplete);
                }
              }
            }
          })
          .start();
        $scope.groups.push({
          nodes: nodes,
          links: links,
          name: key,
          count: count,
          force: force
        });
        count += 1;
      });

      $scope.lookup = {};
      $scope.lookup.node = _.indexBy(data.nodes, 'name');

      _.each($scope.edges, function(edge) {
        edge.source.from = edge.source.from || [];
        edge.source.from.push(edge);

        edge.target.to = edge.target.to || [];
        edge.target.to.push(edge);
      });
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

    $scope.$watchCollection('edges', function(val) {
      if (val) {
        _.each($scope.edges, function(l) {
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
      _.each($scope.edges, function(e) {
        e.opacity = OPAC.unfocused;
      });
      _.each($scope.nodes, function(n) {
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
      _.each($scope.nodes, function(n) {
        n.opacity = OPAC.normal;
      });
      _.each($scope.edges, function(e) {
        e.opacity = OPAC.normal;
      });
    };

    var loadGene = function(data) {

      // Remove all gene nodes
      _.each($scope.groups, function(g) {
        g.nodes = _.filter(g.nodes, function(n) {
          if (_.isEqual(n.type, 'gene')) {
            return false;
          } else {
            return true;
          }
        });
      });

      // Remove all edges to and from gene nodes
      $scope.edges = _.filter($scope.edges, function(edge) {
        if (_.isEqual(edge.target.type, 'gene') || _.isEqual(edge.source.type, 'gene')) {
          return false;
        } else {
          return true;
        }
      });

      var lookup = {};
      lookup.group = _.indexBy($scope.groups, 'name');
      lookup.node = _.indexBy($scope.nodes, 'name');
      // Add all new gene nodes and edges
      _.each(data, function(gene, key) {
        var group = lookup.group[gene.group];
        var newNode = {
          name: key,
          type: 'gene',
          width: 80,
          height: 30,
          from: [],
          to: [],
          group: group.count,
          force: group.force
        };
        group.nodes.push(newNode);
        _.each(gene.sources, function(n) {
          var node = lookup.node[n];
          var edge = {
            source: node,
            target: newNode
          };
          $scope.edges.push(edge);
          node.from.push(edge);
          newNode.to.push(edge);
        });
        _.each(gene.targets, function(n) {
          var node = lookup.node[n];
          var edge = {
            target: node,
            source: newNode
          };
          $scope.edges.push(edge);
          node.to.push(edge);
          newNode.from.push(edge);
        });
        var force = newNode.force;
        force.nodes(group.nodes);
        force.start();
      });
    };

    $scope.$watch('imports.data', function(newVal) {
      if (newVal) {
        runLayout(newVal);
      }
    });

    $scope.$watch('imports.geneData', function(newVal) {
      if (newVal) {
        loadGene(newVal);
      }
    });

  });
