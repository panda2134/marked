const hljs = require('highlight.js')

function getDefaults() {
  return {
    baseUrl: null,
    breaks: false,
    gfm: true,
    headerIds: true,
    headerPrefix: '',
    highlight(code, lang) {
      lang = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(lang, code).value;
    },
    langPrefix: 'hljs language-',
    mangle: true,
    pedantic: false,
    renderer: null,
    sanitize: false,
    sanitizer: null,
    silent: false,
    smartLists: false,
    smartypants: false,
    xhtml: false
  };
}

function changeDefaults(newDefaults) {
  module.exports.defaults = newDefaults;
}

module.exports = {
  defaults: getDefaults(),
  getDefaults,
  changeDefaults
};
