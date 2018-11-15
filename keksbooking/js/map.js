'use strict';

(function () {
  var ESC_KEYCODE = 27;
  var DEFAULT_PIN_X_COORD = 600;
  var DEFAULT_PIN_Y_COORD = 375;
  var MAX_TOP_VALUE = 100;
  var MAX_BOTTOM_VALUE = 700;
  var MAIN_PIN_WIDTH = 65;
  var MAIN_PIN_HEIGHT = 80;
  var isActivePage = false;
  var isCardRender = false;
  var map = document.querySelector('.map');
  var dragAndDropArea = map.querySelector('.map__pinsoverlay');
  var mapPins = map.querySelector('.map__pins');
  var mapFilter = map.querySelector('.map__filters-container');
  var mapMainPin = map.querySelector('.map__pin--main');
  var closePopup = function (articleCard) {
    articleCard.style.display = 'none';
  };
  var onCloseButton = function () {
    var closePopupButton = map.querySelector('.popup__close');
    var articleCard = map.querySelector('.map__card');
    closePopupButton.addEventListener('click', function () {
      closePopup(articleCard);
    });
    document.addEventListener('keydown', function (evt) {
      if (evt.keyCode === ESC_KEYCODE) {
        closePopup(articleCard);
      }
    });
  };
  var getMapPinArray = function () {
    return map.querySelectorAll('.map__pin:not(.map__pin--main)');
  };
  var refreshRegulationValue = function (currentPositionX, currentPositionY) {
    getPositionOfMainPin();
    var regulationValueX = mapMainPin.getBoundingClientRect().left - currentPositionX;
    var regulationValueY = (mapMainPin.getBoundingClientRect().top + pageYOffset) - currentPositionY;
    extremePosition = {
      minX: dragAndDropArea.getBoundingClientRect().left - regulationValueX,
      minY: MAX_TOP_VALUE - regulationValueY,
      maxX: dragAndDropArea.getBoundingClientRect().right - regulationValueX - MAIN_PIN_WIDTH,
      maxY: MAX_BOTTOM_VALUE - regulationValueY - MAIN_PIN_HEIGHT
    };
  };
  var extremePosition = {
    minX: dragAndDropArea.getBoundingClientRect().left,
    minY: MAX_TOP_VALUE,
    maxX: dragAndDropArea.getBoundingClientRect().right - MAIN_PIN_WIDTH,
    maxY: MAX_BOTTOM_VALUE
  };
  var getAllowedCoordinate = function (min, max, thisCoordinate) {
    if (thisCoordinate < min) {
      return min;
    } else if (thisCoordinate > max) {
      return max;
    } else {
      return thisCoordinate;
    }
  };
  var mainPinDafaultPosition = {
    x: DEFAULT_PIN_X_COORD,
    y: DEFAULT_PIN_Y_COORD
  };
  var mainPinPosition = {
    x: DEFAULT_PIN_X_COORD,
    y: DEFAULT_PIN_Y_COORD
  };
  var getPositionOfMainPin = function () {
    var positionX = mapMainPin.offsetLeft;
    var positionY = mapMainPin.offsetTop;
    mainPinPosition.x = positionX;
    mainPinPosition.y = positionY;
  };
  var setDefaultPositionOfMainPin = function () {
    mapMainPin.style.top = (mainPinDafaultPosition.y) + 'px';
    mapMainPin.style.left = (mainPinDafaultPosition.x) + 'px';
  };
  var mapActivate = function (isActivate) {
    if (isActivate) {
      map.classList.remove('map--faded');
    } else {
      window.map.isActivePage = false;
      map.classList.add('map--faded');
    }
  };
  var clearMap = function (hidden) {
    var card = map.querySelector('.map__card');
    var elementsForRemove = getMapPinArray();
    elementsForRemove.forEach(function (item) {
      item.remove();
    });
    if (hidden && card) {
      card.style.display = 'none';
    } else if (card) {
      card.remove();
      window.map.isCardRender = false;
    }
  };
  var onPinClick = function (evt) {
    var serialNumber;

    if (evt.target.hasAttribute('data-serial-number')) {
      serialNumber = evt.target.getAttribute('data-serial-number');
      window.renderCard(serialNumber);
    } else if (evt.target.tagName !== 'HTML' && evt.target.parentElement.hasAttribute('data-serial-number')) {
      serialNumber = evt.target.parentElement.getAttribute('data-serial-number');
      window.renderCard(serialNumber);
    }
  };
  var onMouseDown = function (evt) {
    var startCoords = {
      x: evt.pageX,
      y: evt.pageY
    };
    refreshRegulationValue(evt.pageX, evt.pageY);
    var onMouseMove = function (moveEvt) {
      moveEvt.preventDefault();
      getPositionOfMainPin();
      var shift = {
        x: startCoords.x - getAllowedCoordinate(extremePosition.minX, extremePosition.maxX, moveEvt.pageX),
        y: startCoords.y - getAllowedCoordinate(extremePosition.minY, extremePosition.maxY, moveEvt.pageY)
      };
      startCoords = {
        x: getAllowedCoordinate(extremePosition.minX, extremePosition.maxX, moveEvt.pageX),
        y: getAllowedCoordinate(extremePosition.minY, extremePosition.maxY, moveEvt.pageY)
      };
      window.form.fillAddressInput(false, true);
      mapMainPin.style.top = (mapMainPin.offsetTop - shift.y) + 'px';
      mapMainPin.style.left = (mapMainPin.offsetLeft - shift.x) + 'px';
    };
    var onMouseUp = function (upEvt) {
      upEvt.preventDefault();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  window.map = {
    onPinClick: onPinClick,
    onCloseButton: onCloseButton,
    isCardRender: isCardRender,
    isActivePage: isActivePage,
    clearMap: clearMap,
    mapBlock: map,
    mapMainPin: mapMainPin,
    mapPins: mapPins,
    mapFilter: mapFilter,
    getPositionOfMainPin: getPositionOfMainPin,
    mainPinPosition: mainPinPosition,
    mainPinDafaultPosition: mainPinDafaultPosition,
    setDefaultPositionOfMainPin: setDefaultPositionOfMainPin,
    mapActivate: mapActivate,
    onMouseDown: onMouseDown
  };
})();
