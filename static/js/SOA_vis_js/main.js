(function () {

  'use strict';

  angular.module('app', [])
      .run(function(data) {
        data.fetchJsonData().then(function (response) {
            console.log('data loaded');
        }, console.error);
    })

  .controller('WordcountController', ['$scope', '$log', '$http', '$timeout',
    function($scope, $log, $http, $timeout) {

    $scope.getResults = function() {

      $log.log("test");

      // get the URL from the input
      var userInput = $scope.url;

      // fire the API request
      $http.post('/start', {"url": userInput}).
        success(function(results) {
          $log.log(results);
          getWordCount(results);

        }).
        error(function(error) {
          $log.log(error);
        });

    };

    function getWordCount(jobID) {

      var timeout = "";

      var poller = function() {
        // fire another request
        $http.get('/results/'+jobID).
          success(function(data, status, headers, config) {
            if(status === 202) {
              $log.log(data, status);
            } else if (status === 200){
              $log.log(data);
              $scope.wordcounts = data;
              $timeout.cancel(timeout);
              return false;
            }
            // continue to call the poller() function every 2 seconds
            // until the timeout is cancelled
            timeout = $timeout(poller, 2000);
          });
      };
      poller();
    }

  }
  ]);

  .controller('chartCtrl', function ($scope, bus) {
    'use strict';

    bus.on('updateData', function(data) {
        $scope.data = angular.copy(data);
    });
  });

  .controller('filterCtrl', function ($scope, bus) {
    'use strict';

    bus.on('updateData', function(data) {
        $scope.technos = computeTechnos(data);
        $scope.hosts = computeHosts(data);
    });

    $scope.nameFilter = '';

    var technosFilter = [];
    var hostsFilter = [];

    $scope.$watch('nameFilter', function(name) {
        bus.emit('nameFilterChange', name);
    });

    $scope.toggleTechnoFilter = function(techno) {
        if ($scope.isTechnoInFilter(techno)) {
            technosFilter.splice(technosFilter.indexOf(techno), 1);
        } else {
            technosFilter.push(techno);
        }
        bus.emit('technosFilterChange', technosFilter);
    };

    $scope.isTechnoInFilter = function(techno) {
        return technosFilter.indexOf(techno) !== -1;
    };

    $scope.toggleHostFilter = function(host) {
        if ($scope.isHostInFilter(host)) {
            hostsFilter.splice(hostsFilter.indexOf(host), 1);
        } else {
            hostsFilter.push(host);
        }
        bus.emit('hostsFilterChange', hostsFilter);
    };

    $scope.isHostInFilter = function(host) {
        return hostsFilter.indexOf(host) !== -1;
    };

    function computeTechnos(rootNode) {
        var technos = [];

        function addNodeTechnos(node) {
            if (node.technos) {
                node.technos.forEach(function(techno) {
                    technos[techno] = true;
                });
            }
            if (node.children) {
                node.children.forEach(function(childNode) {
                    addNodeTechnos(childNode);
                });
            }
        }

        addNodeTechnos(rootNode);

        return Object.keys(technos).sort();
    }

    function computeHosts(rootNode) {
        var hosts = {};

        function addNodeHosts(node) {
            if (node.host) {
                for (var i in node.host) {
                    hosts[i] = true;
                }
            }
            if (node.children) {
                node.children.forEach(function(childNode) {
                    addNodeHosts(childNode);
                });
            }
        }

        addNodeHosts(rootNode);

        return Object.keys(hosts).sort();
    }

});
  .controller("NestedListsDemoController", function($scope) {

    $scope.models = {
        selected: null,
        templates: [
            {type: "item", id: 2},
            {type: "core", id: 1, columns: [[], []]}
        ],
        dropzones: {
            "A": [
                {
                    "type": "core",
                    "id": 1,
                    "columns": [
                        [
                            {
                                "type": "item",
                                "id": "1"
                            },
                            {
                                "type": "item",
                                "id": "2"
                            }
                        ],
                        [
                            {
                                "type": "item",
                                "id": "3"
                            }
                        ]
                    ]
                },
                {
                    "type": "item",
                    "id": "4"
                },
                {
                    "type": "item",
                    "id": "5"
                },
                {
                    "type": "item",
                    "id": "6"
                }
            ],
            "B": [
                {
                    "type": "item",
                    "id": 7
                },
                {
                    "type": "item",
                    "id": "8"
                },
                {
                    "type": "core",
                    "id": "2",
                    "columns": [
                        [
                            {
                                "type": "item",
                                "id": "9"
                            },
                            {
                                "type": "item",
                                "id": "10"
                            },
                            {
                                "type": "item",
                                "id": "11"
                            }
                        ],
                        [
                            {
                                "type": "item",
                                "id": "12"
                            },
                            {
                                "type": "core",
                                "id": "3",
                                "columns": [
                                    [
                                        {
                                            "type": "item",
                                            "id": "13"
                                        }
                                    ],
                                    [
                                        {
                                            "type": "item",
                                            "id": "14"
                                        }
                                    ]
                                ]
                            },
                            {
                                "type": "item",
                                "id": "15"
                            },
                            {
                                "type": "item",
                                "id": "16"
                            }
                        ]
                    ]
                },
                {
                    "type": "item",
                    "id": 16
                }
            ]
        }
    };

    $scope.$watch('models.dropzones', function(model) {
        $scope.modelAsJson = angular.toJson(model, true);
    }, true);

});



}());

