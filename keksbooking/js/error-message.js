'use strict';

(function () {
  window.errorMessage = function (message) {
    var errorTemplate = '<div class="error-message" style="z-index:999;position:fixed;left:0;right:0;top:0;bottom:0;background:rgba(0, 0, 0, 0.62);display: flex;justify-content:center;align-items:center;">' +
      '<span style="font-size:20px;display:flex;justify-content: center;align-items:center;background:#fff; border-radius: 5px;padding: 20px 40px;">' + message + '</span>' +
      '</div>';
    document.querySelector('body').insertAdjacentHTML('beforeend', errorTemplate);
    setTimeout(function () {
      document.querySelector('.error-message').remove();
    }, 5000);
  };
})();
