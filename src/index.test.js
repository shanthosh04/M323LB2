const { view, update, app, initModel, rootNode } = require("./index.js");

describe('Quiz Cards', function () {
  it('view function without errors', function () {
    const model = { ...initModel }; 
    const dispatch = () => {}; 

    const renderedView = view(dispatch, model);
    
    expect(renderedView.tagName).toEqual('DIV');
  });
  });
