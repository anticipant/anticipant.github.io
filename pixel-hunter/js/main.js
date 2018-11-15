(function () {
'use strict';

const Limit = {
  LIVES: 3,
  TIME: 30,
  FAST_TIME: 10,
  SLOW_TIME: 20,
};
const Answer = {
  RIGHT: 100,
  FAST_BONUS: 50,
  SLOW_FINE: 50,
};
const getUserResult = (answers, lives) => {
  const LIVE_BONUS = 50;
  let score = 0;
  score = score + lives * LIVE_BONUS;

  if (answers.length < 10 || lives < 0) {
    return -1;
  }
  const positiveArrayAnswers = answers.filter((it) => {
    return it.answer;
  });
  positiveArrayAnswers.forEach((it) => {
    const time = Limit.TIME - it.time;
    if (time < Limit.FAST_TIME) {
      score = score + Answer.RIGHT + Answer.FAST_BONUS;
    } else if (Limit.TIME >= time && time >= Limit.SLOW_TIME) {
      score = score + Answer.RIGHT - Answer.SLOW_FINE;
    } else {
      score = score + Answer.RIGHT;
    }
  });

  return score;
};

const headerState = {
  lives: 3,
  time: 30,
};
const reduceLive = (state) => {
  const lives = state.lives - 1;
  return Object.assign({}, state, {
    lives
  });
};
const generateAnswerObj = (answerResult, timeResult) => {
  let result;
  const timePlayer = Limit.TIME - timeResult;
  if (answerResult) {
    if (timePlayer < Limit.FAST_TIME) {
      result = `fast`;
    } else if (Limit.TIME >= timePlayer && timePlayer >= Limit.SLOW_TIME) {
      result = `slow`;
    } else {
      result = `correct`;
    }
  } else {
    result = `wrong`;
  }
  return {answer: answerResult, time: timeResult, statsResult: result};

};
const tick = (state) => {
  const time = state.time - 1;
  return Object.assign({}, state, {
    time
  });
};
const resetTimer = (state) => {
  return Object.assign({}, state, {
    time: 30,
  });
};
class GameModel {
  constructor(questions, name) {
    this.name = name;
    this.questions = questions;
    this.restart();
  }
  get state() {
    return this._state;
  }
  get playerName() {
    return this._name;
  }
  get lives() {
    return this._state.lives;
  }
  get time() {
    return this._state.time;
  }
  get currentActualQuestion() {
    return this._actualQuestion;
  }
  get answers() {
    return this._answers;
  }
  get userResult() {
    return getUserResult(this._answers, this._state.lives);
  }
  addAnswer(answerResult) {
    this._currentAnswer = answerResult;
    this._answers.push(generateAnswerObj(this._currentAnswer, this._state.time));
  }
  restart() {
    this._name = this.name;
    this._questions = this.questions.slice();
    this._state = Object.assign({}, headerState);
    this._answers = [];
  }
  reduceLive() {
    this._state = reduceLive(this._state);
  }
  getActualQuestion() {
    this._actualQuestion = this._questions.shift();
  }
  isStillQuestion() {
    return this._questions.length > 0;
  }
  resetTimer() {
    this._state = resetTimer(this._state);
  }
  tick() {
    this._state = tick(this._state);
  }
}

class AbstractView {
  constructor() {
    if (new.target === AbstractView) {
      throw new Error(`Can't instantiate AbstractView, only concrete one`);
    }
  }
  get render() {
    throw new Error(`Template is required`);
  }
  get element() {
    if (this._element) {
      return this._element;
    }
    this._element = document.createElement(`div`);
    this._element.innerHTML = this.render().trim();
    this.bind();
    return this._element;
  }
  bind() {}
}

const Bonus = {
  FAST: 50,
  SLOW: -50,
  RIGHT: 100,
  LIVE: 50
};
class StatsModuleView extends AbstractView {
  constructor(data) {
    super();
    this.data = data.reverse();
  }
  getTitle(stats, index) {
    if (index === 0) {
      return `<h1>${stats.result < 0 ? `Поражение!` : `Победа!`}</h1>`;
    }
    return ``;
  }
  userResultMarkup(stats, index) {
    let fastAnswers = 0;
    let slowAnswers = 0;
    let correctAnswers = 0;

    stats.answers.forEach((it) => {
      if (it.statsResult === `fast`) {
        fastAnswers++;
        correctAnswers++;
      } else if (it.statsResult === `slow`) {
        slowAnswers++;
        correctAnswers++;
      } else if (it.statsResult === `correct`) {
        correctAnswers++;
      }
    });

    if (stats.result < 0) {
      return `
${this.getTitle(stats, index)}
<table class="result__table">
	<tr>
		<td class="result__number">${index + 1}</td>
		<td>
			<ul class="stats">
				${stats.answers.map((it) => `<li class="stats__result stats__result&#45;&#45;${it.statsResult}"></li>`).join(``)}
				${new Array(10 - stats.answers.length)
        .fill(`<li class="stats__result stats__result&#45;&#45;unknown"></li>`).join(``)}
			</ul>
		</td>
		<td class="result__total"></td>
		<td class="result__total  result__total--final">fail</td>
	</tr>
</table>
`;
    }
    return `
${this.getTitle(stats, index)}
<table class="result__table">
	<tr>
		<td class="result__number">${index + 1}.</td>
		<td colspan="2">
			<ul class="stats">
				${stats.answers.map((it) => `<li class="stats__result stats__result&#45;&#45;${it.statsResult}"></li>`).join(``)}
				${new Array(10 - stats.answers.length)
      .fill(`<li class="stats__result stats__result&#45;&#45;unknown"></li>`).join(``)}
			</ul>
		</td>
		<td class="result__points">×&nbsp;${Bonus.RIGHT}</td>
		<td class="result__total">
			${Bonus.RIGHT * correctAnswers}
		</td>
	</tr>
	<tr ${fastAnswers === 0 ? `style="display: none;"` : ``}>
		<td></td>
		<td class="result__extra">Бонус за скорость:</td>
		<td class="result__extra">${fastAnswers}&nbsp;<span class="stats__result stats__result--fast"></span></td>
		<td class="result__points">×&nbsp;${Bonus.FAST}</td>
		<td class="result__total">
			${Bonus.FAST * fastAnswers}
		</td>
	</tr>
	<tr ${Bonus.LIVE === 0 ? `style="display: none;"` : ``}>
		<td></td>
		<td class="result__extra">Бонус за жизни:</td>
		<td class="result__extra">${stats.lives}&nbsp;<span class="stats__result stats__result--alive"></span></td>
		<td class="result__points">×&nbsp;${Bonus.LIVE}</td>
		<td class="result__total">
			${Bonus.LIVE * stats.lives}
		</td>
	</tr>
	<tr ${slowAnswers === 0 ? `style="display: none;"` : ``}>
		<td></td>
		<td class="result__extra">Штраф за медлительность:</td>
		<td class="result__extra">${slowAnswers}&nbsp;<span class="stats__result stats__result--slow"></span></td>
		<td class="result__points">×&nbsp;${Bonus.SLOW}</td>
		<td class="result__total">
			${Bonus.SLOW * slowAnswers}
		</td>
	</tr>
	<tr>
		<td colspan="5" class="result__total  result__total--final">${stats.result}</td>
	</tr>
</table>
`;
  }
  render() {
    return `
<header class="header">
	<div class="header__back">
		<button class="back">
			<img src="img/arrow_left.svg" width="45" height="45" alt="Back">
			<img src="img/logo_small.svg" width="101" height="44">
		</button>
	</div>
</header>
<div class="result">
	${this.data.map((it, index) => {
    return `${this.userResultMarkup(it, index).trim()}`;
  }).join(``)}
</div>
`;
  }
  bind() {
    const buttonBackElement = this.element.querySelector(`button.back`);
    buttonBackElement.addEventListener(`click`, () => {
      Router.showGreeting();
    });
  }
}

class RestartModalView extends AbstractView {
  constructor() {
    super();
  }
  render() {
    return `
    <form class="modal-confirm__inner">
      <button class="modal-confirm__close" type="button">Закрыть</button>
      <h2 class="modal-confirm__title">Подтверждение</h2>
      <p class="modal-confirm__text">Вы уверены что хотите начать игру заново?</p>
      <div class="modal-confirm__btn-wrap">
        <button class="modal-confirm__btn modal-confirm__btn--confirm">Ок</button>
        <button class="modal-confirm__btn modal-confirm__btn--cancel">Отмена</button>
      </div>
    </form>`;
  }
  onConfirm() {}
  hideModal(evt) {
    evt.preventDefault();
    this.element.remove();
  }
  bind() {
    const confirmModalElement = this.element.querySelector(`.modal-confirm__btn--confirm`);
    const closeModalElement = this.element.querySelector(`.modal-confirm__close`);
    const cancelModalElement = this.element.querySelector(`.modal-confirm__btn--cancel`);

    confirmModalElement.addEventListener(`click`, (evt) => {
      this.hideModal(evt);
      this.onConfirm();
    });
    cancelModalElement.addEventListener(`click`, (evt) => {
      this.hideModal(evt);
    });
    closeModalElement.addEventListener(`click`, (evt) => {
      this.hideModal(evt);
    });
  }
  get element() {
    if (this._element) {
      return this._element;
    }
    this._element = document.createElement(`section`);
    this._element.classList.add(`modal-confirm`);
    this._element.classList.add(`modal-confirm__wrap`);
    this._element.innerHTML = this.render().trim();
    this.bind();
    return this._element;
  }
}

class GameViewFirst extends AbstractView {
  constructor(question) {
    super();
    this.question = question;
    this.enteredAnswers = [];
    this.userAnswers = [];
  }
  render() {
    return `
  <div class="game">
    <p class="game__task">${this.question.question}</p>
    <form class="game__content">
    ${this.question.imagesPathArray.map((it, index) => `
        <div class="game__option">
        <img src="${it.url}" alt="Option ${index}" width="${it.width}" height="${it.height}">
        <label class="game__answer game__answer--photo">
          <input name="image${index}" type="radio" value="photo">
          <span>Фото</span>
        </label>
        <label class="game__answer game__answer--paint">
          <input name="image${index}" type="radio" value="painting">
          <span>Рисунок</span>
        </label>
      </div>`).join(``)}
    </form>
  </div>`;
  }
  onAnswer() {}
  bind() {
    const formElement = this.element.querySelector(`.game__content`);
    formElement.addEventListener(`change`, (evt) => {
      const answerKey = evt.target.getAttribute(`name`);
      const answerValue = evt.target.value;
      this.checkAnswer(answerKey, answerValue);
    });
  }
  checkCountOfAnswers(clickedAnswerKey, clickedAnswerValue) {
    if (this.enteredAnswers.indexOf(clickedAnswerKey) < 0) {
      this.userAnswers.push({
        answerKey: clickedAnswerKey,
        answerValue: clickedAnswerValue,
      });
      this.enteredAnswers.push(clickedAnswerKey);
    } else {
      this.userAnswers = [{
        answerKey: clickedAnswerKey,
        answerValue: clickedAnswerValue,
      }];
    }
    return this.enteredAnswers.length;
  }
  checkAnswer(answerKey, answerValue) {
    const minNumberAnswers = 2;
    const countOfAnswers = this.checkCountOfAnswers(answerKey, answerValue);
    if (countOfAnswers === minNumberAnswers) {
      const isCorrectAnswers = this.userAnswers.every((it) => {
        return this.question.answers[it.answerKey][it.answerValue];
      });
      this.onAnswer(isCorrectAnswers);
    }
  }
}

class GameViewSecond extends AbstractView {
  constructor(question) {
    super();
    this.question = question;
  }
  render() {
    return `
  <div class="game">
    <p class="game__task">${this.question.question}</p>
    <form class="game__content  game__content--wide">
    ${this.question.imagesPathArray.map((it, index) => `
      <div class="game__option">
        <img src="${it.url}" alt="Option ${index}" width="${it.width}" height="${it.height}">
        <label class="game__answer  game__answer--photo">
          <input name="image${index}" type="radio" value="photo">
          <span>Фото</span>
        </label>
        <label class="game__answer  game__answer--wide  game__answer--paint">
          <input name="image${index}" type="radio" value="painting">
          <span>Рисунок</span>
        </label>
      </div>`).join(``)}
    </form>
  </div>`;
  }
  onAnswer() {}
  bind() {
    const formElement = this.element.querySelector(`.game__content`);
    formElement.addEventListener(`change`, (evt) => {
      const answerKey = evt.target.getAttribute(`name`);
      const answerValue = evt.target.value;
      this.checkAnswer(answerKey, answerValue);
    });
  }
  checkAnswer(answerKey, answerValue) {
    const isCorrectAnswers = !!this.question.answers[answerKey][answerValue];
    this.onAnswer(isCorrectAnswers);
  }
}

class GameViewThird extends AbstractView {
  constructor(question) {
    super();
    this.question = question;
  }
  render() {
    return `
  <div class="game">
      <p class="game__task">${this.question.question}</p>
      <form class="game__content  game__content--triple">
      ${this.question.imagesPathArray.map((it, index) => `
          <div class="game__option">
            <img src="${it.url}" data-name="image${index}" alt="Option 1" width="${it.width}" height="${it.height}">
          </div>`).join(``)}
      </form>
   </div>`;
  }
  onAnswer() {}
  bind() {
    const {image0, image1, image2} = this.question.answers;
    const answers = [image0, image1, image2];
    const answerValue = answers.filter((it) => it[`photo`] === 1).length === 1 ? `photo` : `painting`;
    const formElement = this.element.querySelector(`.game__content`);
    formElement.addEventListener(`click`, (evt) => {
      if (evt.target.classList.contains(`game__option`)) {
        const answerKey = evt.target.querySelector(`img`).getAttribute(`data-name`);
        this.checkAnswer(answerKey, answerValue);
      }
    });
  }
  checkAnswer(answerKey, answerValue) {
    const isCorrectAnswers = !!this.question.answers[answerKey][answerValue];
    this.onAnswer(isCorrectAnswers);
  }
}

class StatsLevelView extends AbstractView {
  constructor(answers) {
    super();
    this.answers = answers;
  }
  render() {
    return `<div class="stats">
    <ul class="stats">
    ${this.answers.map((it) => `<li class="stats__result stats__result&#45;&#45;${it.statsResult}"></li>`).join(``)}
    ${new Array(10 - this.answers.length)
      .fill(`<li class="stats__result stats__result&#45;&#45;unknown"></li>`).join(``)}
    </ul>
  </div>`;
  }
}

class HeaderLevelView extends AbstractView {
  constructor(state) {
    super();
    this.state = state;
  }
  render() {
    return `
<header class="header">
	<div class="header__back">
		<button class="back">
			<img src="img/arrow_left.svg" width="45" height="45" alt="Back">
			<img src="img/logo_small.svg" width="101" height="44">
		</button>
	</div>
	<h1 class="game__timer">${this.state.time}</h1>
	<div class="game__lives">
		${new Array(Limit.LIVES - this.state.lives)
      .fill(`<img src="img/heart__empty.svg" class="game__heart" alt="Life" width="32" height="32">`).join(``)}
		${new Array(this.state.lives)
      .fill(`<img src="img/heart__full.svg" class="game__heart" alt="Life" width="32" height="32">`).join(``)}
	</div>
</header>
`;
  }
}

class FooterView extends AbstractView {
  constructor() {
    super();
  }
  render() {
    return `
    <a href="https://htmlacademy.ru" class="social-link social-link--academy">HTML Academy</a>
    <span class="footer__made-in">Сделано в <a href="https://htmlacademy.ru" class="footer__link">HTML Academy</a> &copy; 2016</span>
    <div class="footer__social-links">
      <a href="https://twitter.com/htmlacademy_ru" class="social-link  social-link--tw">Твиттер</a>
      <a href="https://www.instagram.com/htmlacademy/" class="social-link  social-link--ins">Инстаграм</a>
      <a href="https://www.facebook.com/htmlacademy" class="social-link  social-link--fb">Фэйсбук</a>
      <a href="https://vk.com/htmlacademy" class="social-link  social-link--vk">Вконтакте</a>
    </div>`;
  }
  get element() {
    if (this._element) {
      return this._element;
    }
    this._element = document.createElement(`footer`);
    this._element.classList.add(`footer`);
    this._element.innerHTML = this.render().trim();
    return this._element;
  }
}

const ONE_SECOND = 1000;
const BLINK_TIME = 5;
const QuestionType = {
  TWO_OF_TWO: `two-of-two`,
  TINDER_LIKE: `tinder-like`,
  ONE_OF_THREE: `one-of-three`,
};
class GameScreen {
  constructor(model) {
    this.model = model;
    this.restartModal = new RestartModalView();
    this.restartModal.onConfirm = () => {
      this.removeListener();
      this.stopTimer();
      Router.showGreeting();
    };
    this.getHandler(this.restartModal);
    this.header = new HeaderLevelView(this.model.state);
    this.stats = new StatsLevelView(this.model.answers);
    this._interval = null;
    this.addListener();
  }
  getHandler(setThis) {
    this.onButtonBackClick = (evt) => {
      const target = evt.target;
      const buttonBack = target.closest(`button.back`);

      if (buttonBack) {
        const containerElement = document.querySelector(`.central`);
        containerElement.insertAdjacentElement(`beforeBegin`, setThis.element);
      }
    };
  }
  stopTimer() {
    clearInterval(this._interval);
  }
  resetTimer() {
    this.model.resetTimer();
  }
  startTimer() {
    this._interval = setTimeout(() => {
      this.model.tick();
      this.updateHeader();
      if (this.model.time === BLINK_TIME) {
        this.setBlinkMode(true);
      }
      if (this.model.time === 0) {
        this.checkAnswer(false);
      } else {
        this.startTimer();
      }
    }, ONE_SECOND);
  }
  updateStats() {
    const stats = new StatsLevelView(this.model.answers);
    this.stats.element.replaceWith(stats.element);
    this.stats = stats;
  }
  getStats() {
    const footerElement = document.querySelector(`.footer`);
    footerElement.insertAdjacentElement(`beforeBegin`, this.stats.element);
  }
  updateHeader() {
    const header = new HeaderLevelView(this.model.state);
    this.header.element.replaceWith(header.element);
    this.header = header;
  }
  getHeader() {
    const containerElement = document.querySelector(`.central`);
    containerElement.insertAdjacentElement(`afterbegin`, this.header.element);
  }
  getGameModeView(countOfQuestions) {
    let result;
    switch (countOfQuestions) {
      case QuestionType.TWO_OF_TWO :
        result = new GameViewFirst(this.model.currentActualQuestion);
        break;
      case QuestionType.TINDER_LIKE :
        result = new GameViewSecond(this.model.currentActualQuestion);
        break;
      case QuestionType.ONE_OF_THREE :
        result = new GameViewThird(this.model.currentActualQuestion);
        break;
    }
    return result;
  }
  updateGameBody() {
    const gameBody = this.getGameModeView(this.model.currentActualQuestion.type);
    gameBody.onAnswer = (isCorrectAnswers) => {
      this.checkAnswer(isCorrectAnswers);
    };
    this.level.element.replaceWith(gameBody.element);
    this.level = gameBody;
  }
  getGameBody() {
    const footer = new FooterView();
    const mainElement = document.querySelector(`.central`);
    this.level = this.getGameModeView(this.model.currentActualQuestion.type);
    this.level.onAnswer = (isCorrectAnswers) => {
      this.checkAnswer(isCorrectAnswers);
    };
    mainElement.innerHTML = ``;
    mainElement.appendChild(this.level.element);
    mainElement.insertAdjacentElement(`beforeend`, footer.element);
  }
  showStatsView() {
    this.removeListener();
    Router.showStats(this.model);
  }
  setBlinkMode(mode) {
    document.querySelector(`.central`).classList.toggle(`blink`, mode);
  }
  checkAnswer(isCorrect) {
    this.stopTimer();
    this.setBlinkMode(false);
    this.model.addAnswer(isCorrect);
    this.updateStats();
    if (!isCorrect) {
      this.model.reduceLive();
      if (this.model.lives >= 0) {
        this.updateHeader();
      }
    }
    this.resetTimer();
    if (this.model.isStillQuestion() && this.model.lives >= 0) {
      this.showGame();
    } else {
      this.showStatsView();
    }
  }
  refreshData(isFirstGame) {
    if (isFirstGame) {
      this.model.restart();
    }
    this.model.getActualQuestion();
  }
  addListener() {
    document.addEventListener(`click`, this.onButtonBackClick);
  }
  removeListener() {
    document.removeEventListener(`click`, this.onButtonBackClick);
  }
  showGame(isFirstGame) {
    this.refreshData(isFirstGame);
    if (isFirstGame) {
      this.getGameBody();
      this.getHeader();
      this.getStats();
    } else {
      this.updateGameBody();
      this.updateHeader();
    }
    this.startTimer();
  }
}

class IntroView extends AbstractView {
  constructor() {
    super();
  }
  render() {
    return `
<div id="intro" class="intro">
  <h1 class="intro__asterisk">*</h1>
  <p class="intro__motto"><sup>*</sup> Это не фото. Это рисунок маслом нидерландского художника-фотореалиста Tjalf Sparnaay.</p>
</div>`;
  }
  bind() {
    const triggerElement = this.element.querySelector(`.intro__asterisk`);
    triggerElement.addEventListener(`click`, () => {
      Router.showGreeting();
    });
  }
  get element() {
    if (this._element) {
      return this._element;
    }
    this._element = document.createElement(`div`);
    this._element.classList.add(`central__content`);
    this._element.setAttribute(`id`, `main`);
    this._element.innerHTML = this.render().trim();
    this.bind();
    return this._element;
  }
}

class GreetingView extends AbstractView {
  constructor() {
    super();
  }
  render() {
    return `
<div class="greeting__logo"><img src="img/logo_big.png" width="201" height="89" alt="Pixel Hunter"></div>
  <h1 class="greeting__asterisk">*</h1>
  <div class="greeting__challenge">
    <h3>Лучшие художники-фотореалисты бросают&nbsp;тебе&nbsp;вызов!</h3>
    <p>Правила игры просты.<br>
      Нужно отличить рисунок&nbsp;от фотографии и сделать выбор.<br>
      Задача кажется тривиальной, но не думай, что все так просто.<br>
      Фотореализм обманчив и коварен.<br>
      Помни, главное — смотреть очень внимательно.</p>
  </div>
<div class="greeting__continue"><span><img src="img/arrow_right.svg" width="64" height="64" alt="Next"></span></div>`;
  }
  bind() {
    const triggerElement = this.element.querySelector(`.greeting__continue`);
    triggerElement.addEventListener(`click`, () => {
      Router.showRules();
    });
  }
  get element() {
    if (this._element) {
      return this._element;
    }
    this._element = document.createElement(`div`);
    this._element.classList.add(`greeting`);
    this._element.classList.add(`central--blur`);
    this._element.innerHTML = this.render().trim();
    this.bind();
    return this._element;
  }
}

class RulesView extends AbstractView {
  constructor() {
    super();
  }
  render() {
    return `
  <header class="header">
    <div class="header__back">
      <button class="back">
        <img src="img/arrow_left.svg" width="45" height="45" alt="Back">
        <img src="img/logo_small.svg" width="101" height="44">
      </button>
    </div>
  </header>
  <div class="rules">
    <h1 class="rules__title">Правила</h1>
    <p class="rules__description">Угадай 10 раз для каждого изображения фото <img
      src="img/photo_icon.png" width="16" height="16"> или рисунок <img
      src="img/paint_icon.png" width="16" height="16" alt="">.<br>
      Фотографиями или рисунками могут быть оба изображения.<br>
      На каждую попытку отводится 30 секунд.<br>
      Ошибиться можно не более 3 раз.<br>
      <br>
      Готовы?
    </p>
    <form class="rules__form">
      <input class="rules__input" type="text" placeholder="Ваше Имя">
      <button class="rules__button  continue" type="submit" disabled>Go!</button>
    </form>
  </div>`;
  }
  bind() {
    let userName;
    const rulesInputElement = this.element.querySelector(`.rules__input`);
    rulesInputElement.addEventListener(`keyup`, (evt) => {
      buttonElement.disabled = !(evt.target.value.length > 0);
    });
    rulesInputElement.addEventListener(`change`, (evt) => {
      userName = evt.target.value.trim();
    });
    const buttonElement = this.element.querySelector(`.rules__button`);

    buttonElement.addEventListener(`click`, (evt) => {
      evt.preventDefault();
      Router.showGameScreen(true, userName);
    });
    const buttonBackElement = this.element.querySelector(`button.back`);
    buttonBackElement.addEventListener(`click`, () => {
      Router.showGreeting();
    });

  }
}

class ErrorView extends AbstractView {
  constructor(error) {
    super();
    this.error = error;
  }
  render() {
    return `
<section class="modal-error modal-error__wrap">
	<div class="modal-error__inner">
		<h2 class="modal-error__title">Произошла ошибка!</h2>
		<p class="modal-error__text">${this.error.message}</p>
	</div>
</section>
`;
  }
  bind() {}
  get element() {
    if (this._element) {
      return this._element;
    }
    this._element = document.createElement(`section`);
    this._element.classList.add(`modal-error`);
    this._element.classList.add(`modal-error__wrap`);
    this._element.innerHTML = this.render().trim();
    this.bind();
    return this._element;
  }
}

const UserAnswer = {
  CORRECT: true,
  WRONG: false,
};
const preprocessAnswers = (answers) => {
  let obj = {};
  answers.forEach((it, index) => {
    obj[`image${index}`] = {
      'photo': it.type === `photo` ? UserAnswer.CORRECT : UserAnswer.WRONG,
      'painting': it.type === `painting` ? UserAnswer.CORRECT : UserAnswer.WRONG,
    };
  });
  return obj;
};
const getImagePathArray = (level) => {
  return level.answers.map((it) => {
    return {
      url: it.image.url,
      width: it.image.width,
      height: it.image.height,
    };
  });
};
const adaptServerData = (data) => {
  for (const level of Object.values(data)) {
    level.imagesPathArray = getImagePathArray(level);
    level.answers = preprocessAnswers(level.answers);
  }
  return data;
};

const ServerUrl = {
  QUESTIONS: `https://es.dump.academy/pixel-hunter/questions`,
  STATS: `https://es.dump.academy/pixel-hunter/stats`,
};
const DEFAULT_NAME = `Pistolet`;
const APP_ID = 172395;
const checkStatus = (response) => {
  if (response.ok) {
    return response;
  } else {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
};
const toJSON = (res) => res.json();

class Loader {
  static loadData() {
    return fetch(`${ServerUrl.QUESTIONS}`).then(checkStatus).then(toJSON).then(adaptServerData);
  }

  static loadResults(name = DEFAULT_NAME) {
    return fetch(`${ServerUrl.STATS}/${APP_ID}-${name}`).then(checkStatus).then(toJSON);
  }

  static saveResults(data, name = DEFAULT_NAME) {
    data = Object.assign({name}, data);
    const requestSettings = {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': `application/json`
      },
      method: `POST`
    };
    return fetch(`${ServerUrl.STATS}/${APP_ID}-${name}`, requestSettings).then(checkStatus);
  }
}

const footer = new FooterView();
const changeScreen = (element) => {
  const mainElement = document.querySelector(`.central`);
  mainElement.innerHTML = ``;
  mainElement.appendChild(element);
  mainElement.insertAdjacentElement(`beforeend`, footer.element);
};

let questData;
class Router {
  static loadData() {
    Loader.loadData().
    then((data) => {
      questData = data;
    }).
    then(() => Router.showIntro()).
    catch(Router.showError);
  }
  static showIntro() {
    const intro = new IntroView();
    changeScreen(intro.element);
  }
  static showGreeting() {
    const greeting = new GreetingView();
    changeScreen(greeting.element);
  }
  static showRules() {
    const rules = new RulesView();
    changeScreen(rules.element);
  }
  static showGameScreen(isFirstGame, playerName) {
    const gameScreen = new GameScreen(new GameModel(questData, playerName));
    gameScreen.showGame(isFirstGame);
  }
  static showStats(model) {
    const resultObject = {
      answers: model.answers,
      lives: model.lives,
      result: model.userResult,
    };
    const playerName = model.playerName;
    Loader.saveResults(resultObject, playerName).
    then(() => Loader.loadResults(playerName)).
    then((data) => {
      const statsModuleView = new StatsModuleView(data);
      changeScreen(statsModuleView.element);
    }).
    catch(Router.showError);
  }
  static showError(err) {
    const errorScreen = new ErrorView(err);
    const containerElement = document.querySelector(`.central`);
    containerElement.insertAdjacentElement(`beforeBegin`, errorScreen.element);
  }
}

Router.loadData();

}());

//# sourceMappingURL=main.js.map
