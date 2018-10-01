var parsers;
parsers = require('./i18n-parsers');

// Template delimiters.
var allDelimiters = {};

// Initialize template delimiters.
var addDelimiters = function(name, opener, closer) {
  var delimiters = allDelimiters[name] = {};
  // Used by grunt.
  delimiters.opener = opener;
  delimiters.closer = closer;
  // Generate RegExp patterns dynamically.
  var a = delimiters.opener.replace(/(.)/g, '\\$1');
  var b = '([\\s\\S]+?)' + delimiters.closer.replace(/(.)/g, '\\$1');
  // Used by Lo-Dash.
  delimiters.lodash = {
    evaluate: new RegExp(a + b, 'g'),
    interpolate: new RegExp(a + '=' + b, 'g'),
    escape: new RegExp(a + '-' + b, 'g')
  };
};

// The underscore default template syntax should be a pretty sane default for
// the config system.
addDelimiters('config', '<%', '%>');

var getDelimiters = function() {
  // Get the appropriate delimiters.
  var delimiters = allDelimiters['config'];
  return delimiters;
};

module.exports = function(grunt) {
  var generateOutputPath, translateTemplate;
  grunt.registerMultiTask('helm-i18n', 'Localize Grunt templates', function() {
    var locale, localeData, localePath, localePaths, options, outputPath, parser, template, templatePath, _i, _len, _ref, _results;
    options = this.options({
      locales: [],
      output: '.',
      base: '',
      format: 'json'
    });
    grunt.verbose.writeflags(options, 'Options');
    parser = options.parser ? options.parser : parsers(grunt)[options.format];
    _ref = this.filesSrc;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      templatePath = _ref[_i];
      if (grunt.file.isFile(templatePath)) {
        localePaths = grunt.file.expand(options.locales);
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = localePaths.length; _j < _len1; _j++) {
            localePath = localePaths[_j];
            locale = parser.resolveLocale(localePath);
            outputPath = generateOutputPath(templatePath, locale, options);
            localeData = parser.readLocaleData(localePath);
            template = translateTemplate(templatePath, localeData, options);
            grunt.verbose.writeln("Translating '" + templatePath + "' with locale '" + localePath + "' to '" + outputPath + "'.");
            _results1.push(grunt.file.write(outputPath, template));
          }
          return _results1;
        })());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  });

  translateTemplate = function(templatePath, localeData, options) {
    var template, templateOptions;
    template = grunt.file.read(templatePath);
    templateOptions = {
      data: localeData
    };

    return processTemplate(template, templateOptions);
  };

  generateOutputPath = function(templatePath, locale, options) {
    var filePath, trimmedFilePath;
    if (grunt.util._.startsWith(templatePath, options.base)) {
      filePath = templatePath.slice(options.base.length);
    }
    trimmedFilePath = grunt.util._.trim(filePath, '/');
    return [options.output, locale, trimmedFilePath].join('/');
  };

  processTemplate = function(tmpl, options) {
    if (!options) { options = {}; }
    var delimiters = getDelimiters();
    // Keep track of last change.
    var last = tmpl;
    try {
      // As long as tmpl contains template tags, render it and get the result,
      // otherwise just use the template string.
      while (tmpl.indexOf(delimiters.opener) >= 0) {
        tmpl = templateUtility(tmpl, options.data, grunt.config.data);
        // Abort if template didn't change - nothing left to process!
        if (tmpl === last) { break; }
        last = tmpl;
      }
    } catch (e) {
      e.message = 'An error occurred while processing a template (' + e.message + ').';
      grunt.warn(e, grunt.fail.code.TEMPLATE_ERROR);
    }
    // Normalize linefeeds and return.
    return grunt.util.normalizelf(tmpl);
  };

  templateUtility = function(text, data, options) {
    text || (text = '');
    options || (options = {});

    var isEvaluating,
        result,
        settings = {evaluate: /\<\%([\s\S]+?)\%\>/g, interpolate: /\<\%=([\s\S]+?)\%\>/g, escape: /\<\%-([\s\S]+?)\%\>/g},
        index = 0,
        interpolate = options.interpolate || settings.interpolate || reNoMatch,
        source = "",
        variable = options.variable || settings.variable,
        hasVariable = variable;

    // compile regexp to match each delimiter
    var reDelimiters = RegExp(
      (options.escape || settings.escape || reNoMatch).source + '|' +
      interpolate.source + '|' +
      (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
      (options.evaluate || settings.evaluate || reNoMatch).source + '|$'
    , 'g');

    text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
      interpolateValue || (interpolateValue = esTemplateValue);

      source += text.slice(index, offset);

      // replace delimiters with snippets
      if (interpolateValue) {
        source += data[interpolateValue.trim()] || "DEFAULT_VALUE";   
      }
      
      index = offset + match.length;
    });

    return source;
  }

  return this;
};

/** Used to match "interpolate" template delimiters */
var reInterpolate = /<%=([\s\S]+?)%>/g;

/**
* Used to match ES6 template delimiters
* http://people.mozilla.org/~jorendorff/es6-draft.html#sec-7.8.6
*/
var reEsTemplate = /\$\{((?:(?=\\?)\\?[\s\S])*?)}/g;

/** Used to ensure capturing order of template delimiters */
var reNoMatch = /($^)/;

/** Used to match HTML characters */
var reUnescapedHtml = /[&<>"']/g;

/** Used to match unescaped characters in compiled string literals */
var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

/** Used to detect template delimiter values that require a with-statement */
var reComplexDelimiter = /[-?+=!~*%&^<>|{(\/]|\[\D|\b(?:delete|in|instanceof|new|typeof|void)\b/;

/** Used to match HTML entities */
var reEscapedHtml = /&(?:amp|lt|gt|quot|#x27);/g;

/** Used to match empty string literals in compiled template source */
var reEmptyStringLeading = /\b__p \+= '';/g,
    reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
    reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

/** Used to match regexp flags from their coerced string values */
var reFlags = /\w*$/;

/** Used to insert the data object variable into compiled template source */
var reInsertVariable = /(?:__e|__t = )\(\s*(?![\d\s"']|this\.)/g;

/**
* Used by `template` to escape characters for inclusion in compiled
* string literals.
*
* @private
* @param {String} match The matched character to escape.
* @returns {String} Returns the escaped character.
*/
var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
};

function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
}