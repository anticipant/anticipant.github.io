'use strict';

(function () {
  var UPLOAD_URL = 'https://js.dump.academy/keksobooking';
  var LOAD_URL = 'https://js.dump.academy/keksobooking/data';
  var MAX_ANNOUNCMENT = 5;
  var showFilteredPins = function (renderFunction, pasteTarget, data, quantity) {
    var fragments = document.createDocumentFragment();

    for (var t = 0; t < quantity; t++) {
      fragments.appendChild(renderFunction(data[t]));
    }
    pasteTarget.appendChild(fragments);
  };
  var getTemplateList = function (renderFunction, pasteTarget, isInsertBefore, index) {
    var fragment = document.createDocumentFragment();

    if (isInsertBefore) {
      fragment.appendChild(renderFunction(window.data[index]));
      pasteTarget.insertBefore(fragment, isInsertBefore);
      window.map.onCloseButton();
    } else {
      for (var t = 0; t < MAX_ANNOUNCMENT; t++) {
        fragment.appendChild(renderFunction(window.data[t]));
      }
      pasteTarget.appendChild(fragment);
    }
  };
  window.util = {
    showFilteredPins: showFilteredPins,
    getTemplateList: getTemplateList,
    UPLOAD_URL: UPLOAD_URL,
    LOAD_URL: LOAD_URL
  };
})();
