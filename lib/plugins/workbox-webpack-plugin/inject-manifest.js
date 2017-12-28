'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assert = require('assert');
var path = require('path');

var _require = require('workbox-build'),
    getManifest = _require.getManifest;

var convertStringToAsset = require('./lib/convert-string-to-asset');
var getAssetHash = require('./lib/get-asset-hash');
var getManifestEntriesFromCompilation = require('./lib/get-manifest-entries-from-compilation');
var getWorkboxSWImports = require('./lib/get-workbox-sw-imports');
var readFileWrapper = require('./lib/read-file-wrapper');
var sanitizeConfig = require('./lib/sanitize-config');
var stringifyManifest = require('./lib/stringify-manifest');

var InjectManifest = function () {
  function InjectManifest() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, InjectManifest);

    assert(typeof config.swSrc === 'string', 'swSrc must be set to the path ' + 'to an existing service worker file.');

    this.config = (0, _assign2.default)({}, {
      chunks: [],
      excludeChunks: [],
      importScripts: [],
      importWorkboxFrom: 'cdn',
      swDest: path.basename(config.swSrc)
    }, config);
  }

  (0, _createClass3.default)(InjectManifest, [{
    key: 'handleEmit',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(compilation, readFile) {
        var workboxSWImports, entries, sanitizedConfig, _ref2, manifestEntries, manifestString, manifestAsset, manifestHash, manifestFilename, originalSWString, importScriptsString, postInjectionSWString;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                workboxSWImports = getWorkboxSWImports(compilation, this.config);
                entries = getManifestEntriesFromCompilation(compilation, this.config);
                sanitizedConfig = sanitizeConfig.forGetManifest(this.config);

                if (!((0, _keys2.default)(sanitizedConfig).length > 0)) {
                  _context.next = 10;
                  break;
                }

                sanitizedConfig.globPatterns = sanitizedConfig.globPatterns || [];
                _context.next = 7;
                return getManifest(sanitizedConfig);

              case 7:
                _ref2 = _context.sent;
                manifestEntries = _ref2.manifestEntries;

                entries = entries.concat(manifestEntries);

              case 10:
                manifestString = stringifyManifest(entries);
                manifestAsset = convertStringToAsset(manifestString);
                manifestHash = getAssetHash(manifestAsset);
                manifestFilename = 'precache-manifest.' + manifestHash + '.js';

                compilation.assets[manifestFilename] = manifestAsset;
                this.config.importScripts.push(manifestFilename);

                if (workboxSWImports) {
                  this.config.importScripts = this.config.importScripts.concat(workboxSWImports);
                }

                _context.next = 19;
                return readFileWrapper(readFile, this.config.swSrc);

              case 19:
                originalSWString = _context.sent;
                importScriptsString = this.config.importScripts.map(_stringify2.default).join(', ');
                postInjectionSWString = 'importScripts(' + importScriptsString + ');\n\n' + originalSWString + '\n';


                compilation.assets[this.config.swDest] = convertStringToAsset(postInjectionSWString);

              case 23:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function handleEmit(_x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return handleEmit;
    }()
  }, {
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      compiler.plugin('emit', function (compilation, next) {
        _this.handleEmit(compilation, compiler.inputFileSystem._readFile).then(next).catch(next);
      });
    }
  }]);
  return InjectManifest;
}();

module.exports = InjectManifest;