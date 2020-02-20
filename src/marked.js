/**
 * Copyright (c) 2011-2018, Christopher Jeffrey. (MIT License)
 * Edited to allow Element-UI style rendering
 * Also modified into ES6-style import
 */

import Lexer from 'marked/src/Lexer'
import Parser from './Parser'
import Renderer from 'marked/src/Renderer'
import TextRenderer from 'marked/src/TextRenderer'
import InlineLexer from 'marked/src/InlineLexer'
import Slugger from 'marked/src/Slugger'
import { merge, checkSanitizeDeprecation, escape } from 'marked/src/helpers'
import { defaults, getDefaults, changeDefaults } from 'marked/src/defaults'
import hljs from 'highlight.js'
import { getRandomUint32 } from 'assets/utils'

/**
 * Marked
 */
function marked(src, opt, callback) {
  // throw error in case of non string input
  if (typeof src === 'undefined' || src === null) {
    throw new Error('marked(): input parameter is undefined or null');
  }
  if (typeof src !== 'string') {
    throw new Error('marked(): input parameter is of type '
      + Object.prototype.toString.call(src) + ', string expected');
  }

  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});
    checkSanitizeDeprecation(opt);
    const highlight = opt.highlight;
    let tokens,
      pending,
      i = 0;

    try {
      tokens = Lexer.lex(src, opt);
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    const done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      let out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    opt = merge({}, marked.defaults, opt || {});
    checkSanitizeDeprecation(opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/markedjs/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occurred:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  changeDefaults(marked.defaults);
  return marked;
};

marked.getDefaults = getDefaults;

marked.defaults = defaults;

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;
marked.TextRenderer = TextRenderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.Slugger = Slugger;

marked.parse = marked;

// load element-ui-related options

let renderer = new marked.Renderer()

renderer.heading = function(text, level) {
  const anchor = text.toLowerCase().replace(/\s+/g, '-') + '-' + getRandomUint32()
  return `
    <h${level} id="${anchor}">
      <a href="#${anchor}" class="heading-anchor">#</a>
      ${text}
    </h${level}>
  `
}

renderer.listitem = function(res, task) {
  return `<li class="${task ? 'task-item' : ''}">` + res + '</li>'
}

renderer.codespan = function(text) {
  return '<code class="inline-code">' + text + '</code>'
}

const marked_defaults = {
  renderer,
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    lang = hljs.getLanguage(lang) ? lang : 'plaintext'
    return hljs.highlight(lang, code).value;
  }
};

marked.setOptions(marked_defaults)

// export
export default marked
