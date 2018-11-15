'use strict';

(function () {
  var template = document.querySelector('template').content;
  var cardTemplate = template.querySelector('article.map__card');
  var valueToAnotherValue = {
    'flat': 'Квартира',
    'house': 'Дом',
    'bungalo': 'Бунгало'
  };
  var getListFeatures = function (features) {
    var listFeatures = '';

    features.forEach(function (item) {
      listFeatures = listFeatures + '<li class="feature feature--' + item + '"></li>';
    });
    return listFeatures;
  };
  var getListPhotos = function (photos) {
    var listPhotos = '';
    photos.forEach(function (item) {
      listPhotos = listPhotos + '<li><img src="' + item + '" width="70" height="70"></li>';
    });
    return listPhotos;
  };
  var getRoomsWordForm = function (countOfRooms) {
    var wordForm;
    switch (countOfRooms) {
      case 1:
        wordForm = 'комната';
        break;
      case 2:
      case 3:
      case 4:
        wordForm = 'комнаты';
        break;
      default:
        wordForm = 'комнат';
    }
    return wordForm;
  };
  var getTypeOfHouse = function (type) {
    return valueToAnotherValue[type];
  };
  var fillCards = function (target, targetAnnouncement) {
    var rooms = targetAnnouncement.offer.rooms;
    var guests = targetAnnouncement.offer.guests;
    var guestsWordForm = (targetAnnouncement.offer.guests) > 1 ? 'гостей' : 'гостя';

    target.querySelector('h3').textContent = targetAnnouncement.offer.title;
    target.querySelector('h3 + p > small').textContent = targetAnnouncement.offer.address;
    target.querySelector('h4').textContent = getTypeOfHouse(targetAnnouncement.offer.type);
    target.querySelector('h4 + p').textContent = (rooms + ' ' + getRoomsWordForm(rooms) + ' для ' + guests + ' ' + guestsWordForm);
    target.querySelector('h4 + p + p').textContent = 'Заезд после ' + targetAnnouncement.offer.checkin + ', выезд до ' + targetAnnouncement.offer.checkout;
    target.querySelector('.popup__price').innerHTML = (targetAnnouncement.offer.price + '&#x20bd;/ночь');
    target.querySelector('.popup__features').innerHTML = getListFeatures(targetAnnouncement.offer.features);
    target.querySelector('.popup__features + p').textContent = targetAnnouncement.offer.description;
    target.querySelector('.popup__pictures').innerHTML = getListPhotos(targetAnnouncement.offer.photos);
    target.querySelector('.popup__avatar').setAttribute('src', targetAnnouncement.author.avatar);
  };
  var render = function (announcement) {
    var cardElement = cardTemplate.cloneNode(true);

    fillCards(cardElement, announcement);
    return cardElement;
  };
  var refresh = function (announcements, announcementNumber) {
    var articleCard = document.querySelector('.map .map__card');
    var number = +announcementNumber;
    var announcement = announcements[number];

    fillCards(articleCard, announcement);
    articleCard.style.display = 'block';
  };
  window.renderCard = function (serialNumber) {
    if (!window.map.isCardRender) {
      window.map.isCardRender = true;
      window.util.getTemplateList(render, window.map.mapBlock, window.map.mapFilter, serialNumber);
    }
    refresh(window.data, serialNumber);
  };
})();
