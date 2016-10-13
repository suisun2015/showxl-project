//$(document).ready(function() {});
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

var myApp = angular.module('myApp', []);

function Main($scope, $http){
  $http.get('http://api.randomuser.me/0.4/?results=6').success(function(data) {
    $scope.users = data.results;
  }).error(function(data, status) {
    alert('get data error!');
  });

  $scope.randomDate = function() {
    var start = new Date(2013, 1, 2);
    var end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  $scope.doPost = function() {
    $http.get('http://api.randomuser.me/0.4/').success(function(data) {
      var newUser = data.results[0];
      newUser.user.text = $('#inputText').val();
      newUser.date = new Date();
      $scope.users.push(newUser);
    }).error(function(data, status) {
      alert('get data error!');
    });
  }
}
