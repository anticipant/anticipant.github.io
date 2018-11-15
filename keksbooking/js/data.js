'use strict';

(function () {
  var onError = function (message) {
    window.map.isActivePage = true;
    window.errorMessage(message);
  };
  var onLoad = function (data) {
    data.forEach(function (item, index) {
      item.id = index;
    });
    window.data = data;
  };
  window.load('GET', window.util.LOAD_URL, onLoad, onError);
})();
