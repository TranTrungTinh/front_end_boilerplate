import { paths, config } from "../../../gulpfile.babel";
import path from 'path';

module.exports.register = function (Handlebars) {
  Handlebars.registerHelper('assign', function (varName, varValue, options) {
    if (!options.data.root) {
      options.data.root = {};
    }
    options.data.root[varName] = varValue;
  });

  Handlebars.registerHelper('ifCond', function(v1, v2, options) {
    if(v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
};
