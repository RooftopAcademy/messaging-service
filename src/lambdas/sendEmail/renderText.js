const { compile } = require('handlebars');

module.exports = function renderText(text, data) {
  const template = compile(text);

  return template(data);
};
