import hh from "hyperscript-helpers";
import { h, diff, patch } from "virtual-dom";
import createElement from "virtual-dom/create-element";

const { div, button, p, h1, input, br } = hh(h);

const btnStyle = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

const MESSAGES = {
  QUESTION_CHANGE: "QUESTION_CHANGE",
  ANSWER_CHANGE: "ANSWER_CHANGE",
  ADD_CARD: "ADD_CARD",
  TOGGLE_ANSWER: "TOGGLE_ANSWER",
  DELETE_CARD: "DELETE_CARD",
  EDIT_CARD: "EDIT_CARD",
  RATE_CARD: "RATE_CARD",
};

function createView(dispatch, model) {
  return div({}, [
    div([
      input({
        type: "text",
        placeholder: "Frage eingeben",
        value: model.question,
        oninput: (event) =>
          dispatch({ type: MESSAGES.QUESTION_CHANGE, value: event.target.value }),
        className: "border border-gray-300 rounded p-1 mr-2", 
      }),
      input({
        type: "text",
        placeholder: "Antwort eingeben",
        value: model.answer,
        oninput: (event) =>
          dispatch({ type: MESSAGES.ANSWER_CHANGE, value: event.target.value }),
        className: "border border-gray-300 rounded p-1 mr-2",
      }),
      button({ onclick: () => dispatch({ type: MESSAGES.ADD_CARD }), className: btnStyle }, "Speichern"),
    ]),
    ...model.cards.map((card, index) =>
      div(
        {
          key: index,
          className: "bg-teal-700 w-60 break-words relative m-10 p-10",
        },
        [
          p({ className: " absolute top-5 right-5"},
            [
              button({ onclick: () => dispatch({ type: MESSAGES.EDIT_CARD, index }) }, "Bearbeiten"),
              
              button({ onclick: () => dispatch({ type: MESSAGES.DELETE_CARD, index }) }, "X" ),
            ]
          ),
          p({}, "Frage"),
          p({}, card.question),
          br({}),
          button({ onclick: () => dispatch({ type: MESSAGES.TOGGLE_ANSWER, index }) }, card.showAnswer ? "Verbergen" : "Anzeigen"),
          card.showAnswer ? p({}, card.answer) : null,
          card.showAnswer ? br({}) : null,
          div({}, [
            "Bewertung: ",
            button({ onclick: () => dispatch({ type: MESSAGES.RATE_CARD, index, rating: 0 }) }, "Schlecht" ),

            button({ onclick: () => dispatch({ type: MESSAGES.RATE_CARD, index, rating: 1 }) }, "Gut"),

            button({ onclick: () => dispatch({ type: MESSAGES.RATE_CARD, index, rating: 2 }),},"Sehr Gut"),
          ])
        ]
      )
    )
  ]);
}

function update(message, model) {
  switch (message.type) {
    case MESSAGES.QUESTION_CHANGE:
      return { ...model, question: message.value };
    case MESSAGES.ANSWER_CHANGE:
      return { ...model, answer: message.value };
    case MESSAGES.ADD_CARD:
      return {
        ...model,
        cards: [
          ...model.cards,
          { question: model.question, answer: model.answer, showAnswer: false, rating: 0 },
        ],
        question: "",
        answer: "",
      };
    case MESSAGES.TOGGLE_ANSWER:
      const updatedCards = [...model.cards];
      updatedCards[message.index].showAnswer = !updatedCards[message.index].showAnswer;
      return { ...model, cards: updatedCards };
    case MESSAGES.DELETE_CARD:
      return { ...model, cards: model.cards.filter((_, index) => index !== message.index) };
    case MESSAGES.EDIT_CARD:
      const cardToEdit = model.cards[message.index];
      return {
        ...model,
        question: cardToEdit.question,
        answer: cardToEdit.answer,
        cards: model.cards.filter((_, index) => index !== message.index),
      };
    case MESSAGES.RATE_CARD:
      const ratedCards = [...model.cards];
      ratedCards[message.index].rating += message.rating;
      return { ...model, cards: ratedCards };
    default:
      return model;
  }
}

function app(initModel, update, view, node) {
  let model = initModel;
  let currentView = view(dispatch, model);
  let rootNode = createElement(currentView);
  node.appendChild(rootNode);
  function dispatch(msg) {
    model = update(msg, model);
    const updatedView = view(dispatch, model);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  }
}

const initModel = {
  question: "",
  answer: "",
  cards: [],
};

const rootNode = document.getElementById("app");
app(initModel, update, createView, rootNode);
