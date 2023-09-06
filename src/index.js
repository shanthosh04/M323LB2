import hh from "hyperscript-helpers";
import { h, diff, patch } from "virtual-dom";
import createElement from "virtual-dom/create-element";

// allows using html tags as functions in javascript
const { div, button, p, h1 } = hh(h);

// A combination of Tailwind classes which represent a (more or less nice) button style
const btnStyle = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

const MESSAGES = {
  QUESTION_CHANGE: "QUESTION_CHANGE",
  ANSWER_CHANGE: "ANSWER_CHANGE",
  ADD_CARD: "ADD_CARD",
  TOGGLE_ANSWER: "TOGGLE_ANSWER",
  DELETE_CARD: "DELETE_CARD",
  EDIT_CARD: "EDIT_CARD",
  RATE_CARD: "RATE_CARD"
};

function createView(dispatch, model) {
  return div({}, [
    div([
      input({
        type: "text",
        placeholder: "Frage eingeben",
        value: model.question,
        oninput: event =>
          dispatch({ type: MESSAGES.QUESTION_CHANGE, value: event.target.value }),
        style: { marginRight: "10px" }
      }),
      input({
        type: "text",
        placeholder: "Antwort eingeben",
        value: model.answer,
        oninput: event =>
          dispatch({ type: MESSAGES.ANSWER_CHANGE, value: event.target.value }),
        style: { marginRight: "10px" }
      }),
      button({ onclick: () => dispatch({ type: MESSAGES.ADD_CARD }) }, "✅")
    ]),
    ...model.cards.map((card, index) =>
      div(
        {
          key: index,
          style: {
            backgroundColor: "lightyellow",
            width: "60%",
            wordWrap: "break-word",
            position: "relative",
            margin: "10px",
            padding: "10px"
          }
        },
        [
          p(
            {
              style: {
                position: "absolute",
                top: "5px",
                right: "5px"
              }
            },
            [
              button(
                {
                  onclick: () => dispatch({ type: MESSAGES.EDIT_CARD, index })
                },
                "✏️"
              ),
              " ",
              button(
                {
                  onclick: () => dispatch({ type: MESSAGES.DELETE_CARD, index })
                },
                "❌"
              )
            ]
          ),
          p({}, "Frage"),
          p({}, card.question),
          br({}),
          button(
            {
              onclick: () => dispatch({ type: MESSAGES.TOGGLE_ANSWER, index })
            },
            card.showAnswer ? "Antwort verbergen" : "Antwort anzeigen"
          ),
          card.showAnswer ? p({}, card.answer) : null,
          card.showAnswer ? br({}) : null,
          div({}, [
            "Bewertung: ",
            button(
              {
                onclick: () =>
                  dispatch({ type: MESSAGES.RATE_CARD, index, rating: 0 })
              },
              "🟥"
            ),
            " ",
            button(
              {
                onclick: () =>
                  dispatch({ type: MESSAGES.RATE_CARD, index, rating: 1 })
              },
              "🟨"
            ),
            " ",
            button(
              {
                onclick: () =>
                  dispatch({ type: MESSAGES.RATE_CARD, index, rating: 2 })
              },
              "🟩"
            )
          ])
        ]
      )
    )
  ]);
}

function updateModel(message, model) {
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
          { question: model.question, answer: model.answer, showAnswer: false, rating: 0 }
        ],
        question: "",
        answer: ""
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
        cards: model.cards.filter((_, index) => index !== message.index)
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
  cards: []
};

const rootNode = document.getElementById("app");
app(initModel, update, view, rootNode);