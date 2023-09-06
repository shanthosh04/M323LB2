// Wir laden nützliche Werkzeuge, die uns beim Programmieren der App helfen.

// Importieren bedeutet, dass wir Code von anderen Orten "mitbringen", damit wir ihn hier nutzen können.

import hh from "hyperscript-helpers";

import { h, diff, patch } from "virtual-dom";

import createElement from "virtual-dom/create-element";

 

// Das vereinfacht das Erstellen von HTML-Elementen wie 'div' oder 'button'.

// 'div', 'button', usw. sind jetzt einfache Funktionen, die wir später aufrufen können.

const { div, button, input, p, br } = hh(h);

 

// Das sind die verschiedenen Aktionen, die in der App auftreten können.

// Sie sind wie Nachrichten, die sagen, was in der App passieren soll.

const MESSAGES = {

  QUESTION_CHANGE: "QUESTION_CHANGE",

  ANSWER_CHANGE: "ANSWER_CHANGE",

  ADD_CARD: "ADD_CARD",

  TOGGLE_ANSWER: "TOGGLE_ANSWER",

  DELETE_CARD: "DELETE_CARD",

  EDIT_CARD: "EDIT_CARD",

  RATE_CARD: "RATE_CARD"

};

 

// Die Funktion baut die Darstellung unserer App.

// Sie legt fest, was der Nutzer sieht.

// 'dispatch' ist eine Funktion, die Aktionen an andere Teile der App sendet.

// 'model' enthält die aktuellen Daten der App, wie z.B. den Text einer Eingabe.

function createView(dispatch, model) {

  return div({}, [

    div([

      input({

        type: "text",

        placeholder: "Frage eingeben",

        value: model.question,

        oninput: event => dispatch({ type: MESSAGES.QUESTION_CHANGE, value: event.target.value }),

        style: { marginRight: '10px' }

      }),

      input({

        type: "text",

        placeholder: "Antwort eingeben",

        value: model.answer,

        oninput: event => dispatch({ type: MESSAGES.ANSWER_CHANGE, value: event.target.value }),

        style: { marginRight: '10px' }

      }),

      button({ onclick: () => dispatch({ type: MESSAGES.ADD_CARD }) }, "✅")

    ]),

    ...model.cards.map((card, index) =>

      div({

        key: index,

        style: {

          backgroundColor: 'lightyellow',

          width: '60%',

          wordWrap: 'break-word',

          position: 'relative',

          margin: '10px',

          padding: '10px'

        }

      }, [

        p({

          style: {

            position: 'absolute',

            top: '5px',

            right: '5px'

          }

        }, [

          button({

            onclick: () => dispatch({ type: MESSAGES.EDIT_CARD, index }),

          }, "✏️"),

          " ",

          button({

            onclick: () => dispatch({ type: MESSAGES.DELETE_CARD, index }),

          }, "❌")

        ]),

        p({ }, "Frage"),

        p({}, card.question),

        br({}),

        button({

          onclick: () => dispatch({ type: MESSAGES.TOGGLE_ANSWER, index }),

        }, card.showAnswer ? "Antwort verbergen" : "Antwort anzeigen"),

        card.showAnswer ? p({}, card.answer) : null,

        card.showAnswer ? br({}) : null,

        div({}, [

          "Bewertung: ",

          button({ onclick: () => dispatch({ type: MESSAGES.RATE_CARD, index, rating: 0 }) }, "🟥"),

          " ",

          button({ onclick: () => dispatch({ type: MESSAGES.RATE_CARD, index, rating: 1 }) }, "🟨"),

          " ",

          button({ onclick: () => dispatch({ type: MESSAGES.RATE_CARD, index, rating: 2 }) }, "🟩")

        ])

      ])

    )

  ]);

}

 

// Diese Funktion aktualisiert die Daten der App,

// basierend auf den Aktionen des Nutzers.

// 'message' ist die Nachricht, die sagt, welche Aktion passiert ist.

// 'model' enthält die aktuellen Daten der App.

function updateModel(message, model) {

  switch (message.type) {

    case MESSAGES.QUESTION_CHANGE:

      return { ...model, question: message.value };

    case MESSAGES.ANSWER_CHANGE:

      return { ...model, answer: message.value };

    case MESSAGES.ADD_CARD:

      return {

        ...model,

        cards: [...model.cards, { question: model.question, answer: model.answer, showAnswer: false, rating: 0 }],

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

 

// Diese Funktion startet die App und verwaltet ihre Aktualisierungen.

// 'initModel' sind die Anfangsdaten, 'updateModel' und 'createView' sind Funktionen,

// die die App aktualisieren und darstellen.

// 'rootElement' ist der Ort im HTML-Dokument, an dem die App angezeigt wird.

function runApp(initModel, updateModel, createView, rootElement) {

  let model = initModel;

  let currentView = createView(dispatch, model);

  let rootNode = createElement(currentView);

  rootElement.appendChild(rootNode);

 

  // Die dispatch-Funktion wird aufgerufen, wenn der Benutzer eine Aktion ausführt, wie z.B. einen Button klicken.

  function dispatch(message) {

    // 1. Die Daten der App werden aktualisiert. Das "message"-Objekt sagt uns, welche Aktion der Benutzer gemacht hat.

    model = updateModel(message, model);

 

    // 2. Danach wird die Webseite neu erstellt, um die neuen Daten anzuzeigen.

    const updatedView = createView(dispatch, model);

 

    // 3. Wir prüfen, welche Teile der alten und der neuen Webseite unterschiedlich sind.

    const patches = diff(currentView, updatedView);

 

    // 4. Nur die unterschiedlichen Teile der Webseite werden aktualisiert. So wird die Webseite schneller geladen.

    rootNode = patch(rootNode, patches);

 

    // 5. Wir speichern die neue Version der Webseite, um sie später wieder verwenden zu können.

    currentView = updatedView;

  }

}

 

 

// Das ist unser Startpunkt. Zu Beginn ist alles leer.

// Es enthält leere Felder für Fragen und Antworten, und eine leere Liste für Karten.

const initModel = {

  question: "",

  answer: "",

  cards: [],

};

 

// Das ist der Ort im HTML-Dokument, an dem unsere App erscheinen soll.

// 'document.getElementById("app")' sucht nach einem Element mit der ID "app" im HTML-Dokument.

const rootElement = document.getElementById("app");

 

// Und los geht's, die App wird gestartet.

// Wir rufen die Funktion 'runApp' auf und geben ihr alles, was sie zum Starten der App braucht.

runApp(initModel, updateModel, createView, rootElement);

