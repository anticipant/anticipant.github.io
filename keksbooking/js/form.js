'use strict';

(function () {
  var VERTICAL_SHIFT_OF_MAIN_PIN = 48;
  var MIN_PRICE_BUNGALO = 0;
  var MIN_PRICE_FLAT = 1000;
  var MIN_PRICE_HOUSE = 5000;
  var MIN_PRICE_PALACE = 10000;
  var mainPinPosition = window.map.mainPinPosition;
  var mainPinDafaultPosition = window.map.mainPinDafaultPosition;
  var form = document.querySelector('.notice__form');
  var resetButtom = form.querySelector('.form__reset');
  var address = form.querySelector('#address');
  var formFieldsets = form.querySelectorAll('fieldset');
  var toggleFormDisabledStatus = function (status) {
    formFieldsets.forEach(function (item) {
      item.disabled = status;
    });
  };
  var fillAddressInput = function (isDefault, withShift) {
    var coordX;
    var coordY;

    if (isDefault) {
      coordX = mainPinDafaultPosition.x;
      coordY = mainPinDafaultPosition.y;
    } else {
      coordX = mainPinPosition.x;
      coordY = mainPinPosition.y;
    }
    if (withShift) {
      address.value = coordX + ', ' + (coordY + VERTICAL_SHIFT_OF_MAIN_PIN);
    } else {
      address.value = coordX + ', ' + coordY;
    }
  };
  var resetForm = function () {
    form.reset();
  };
  fillAddressInput();
  toggleFormDisabledStatus(true);
  var formActivate = function (isActive) {
    if (isActive) {
      form.classList.remove('notice__form--disabled');
      toggleFormDisabledStatus(false);
    } else {
      form.classList.add('notice__form--disabled');
      toggleFormDisabledStatus(true);
    }
  };
  var timeIn = form.querySelector('#timein');
  var timeOut = form.querySelector('#timeout');
  var roomNumber = form.querySelector('#room_number');
  var capacity = form.querySelector('#capacity');
  var priceOfApartment = form.querySelector('#price');
  var changeMinValue = function (number) {
    priceOfApartment.setAttribute('min', number);
  };
  var toggleMinPrice = function (evt) {
    var value = evt.target.value;

    switch (value) {
      case 'bungalo':
        changeMinValue(MIN_PRICE_BUNGALO);
        break;
      case 'flat':
        changeMinValue(MIN_PRICE_FLAT);
        break;
      case 'house':
        changeMinValue(MIN_PRICE_HOUSE);
        break;
      case 'palace':
        changeMinValue(MIN_PRICE_PALACE);
        break;
    }
  };
  var toggleTime = function (evt) {
    var targetElement = evt.target;
    var valueOfTarget = targetElement.value;

    switch (targetElement.name) {
      case 'timein':
        timeOut.value = valueOfTarget;
        break;
      case 'timeout':
        timeIn.value = valueOfTarget;
        break;
    }
  };
  var refreshDisabledOption = function (roomQuantity) {
    var countOfOptions = capacity.querySelectorAll('[value]').length;

    for (var g = 0; g < countOfOptions; g++) {
      if (g <= roomQuantity && g > 0 && roomQuantity !== 100) {
        capacity.querySelector('[value="' + g + '"]').disabled = false;
      } else if (roomQuantity === 100 && g === 0) {
        capacity.querySelector('[value="' + g + '"]').disabled = false;
      } else {
        capacity.querySelector('[value="' + g + '"]').disabled = true;
      }
    }
  };
  var setValidityMessage = function () {
    var capacityOption = capacity.querySelector('[value="' + capacity.value + '"]');
    var capacityOptionText = capacityOption.textContent;

    roomNumber.setCustomValidity(capacityOption.disabled ? ('Данное количество комнат не рассчитанно ' + capacityOptionText) : '');
  };
  var togglePermitOfAvailableGuests = function (evt) {
    var targetElement = evt.target;
    var valueOfTarget = +targetElement.value;

    refreshDisabledOption(valueOfTarget);
    setValidityMessage();
  };
  var setErrorBorder = function (thisInput, isNeed) {
    thisInput.style.border = isNeed ? '2px solid red' : '';
  };
  var checkValdity = function (inputElement) {
    setErrorBorder(inputElement.target, !inputElement.target.validity.valid);
  };
  var resetPage = function () {
    window.map.clearMap();
    window.map.mapActivate(false);
    window.filter.resetFilter();
    resetForm();
    formActivate(false);
    fillAddressInput(true, false);
    window.map.setDefaultPositionOfMainPin();
    window.map.mapBlock.removeEventListener('click', window.map.onPinClick);
    form.removeEventListener('submit', onSubmitForm);
    resetButtom.removeEventListener('click', resetPage);
    window.filter.filtersForm.removeEventListener('change', window.filter.updateFilteredAds);
  };
  var addFormListeners = function () {
    form.addEventListener('change', function (evt) {
      var idCompare = evt.target.getAttribute('id');

      switch (idCompare) {
        case 'title':
        case 'price':
          checkValdity(evt);
          break;
        case 'type':
          toggleMinPrice(evt);
          break;
        case 'timein':
        case 'timeout':
          toggleTime(evt);
          break;
        case 'room_number':
          togglePermitOfAvailableGuests(evt);
          break;
        case 'capacity':
          setValidityMessage();
          break;
      }
    });
    form.querySelectorAll('input:required').forEach(function (item) {
      item.addEventListener('invalid', function () {
        setErrorBorder(item, true);
      });
    });
  };
  var onError = function (message) {
    window.errorMessage(message);
  };
  var onLoad = function () {
    resetPage();
  };
  var onSubmitForm = function (evt) {
    window.load('POST', window.util.UPLOAD_URL, onLoad, onError, new FormData(form));
    evt.preventDefault();
  };
  window.form = {
    resetButtom: resetButtom,
    formBlock: form,
    resetPage: resetPage,
    onSubmitForm: onSubmitForm,
    formActivate: formActivate,
    fillAddressInput: fillAddressInput,
    addFormListeners: addFormListeners
  };
})();
