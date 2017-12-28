'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('workbox-build'),
    generateSWString = _require.generateSWString;

var convertStringToAsset = require('./lib/convert-string-to-asset');
var getAssetHash = require('./lib/get-asset-hash');
var getManifestEntriesFromCompilation = require('./lib/get-manifest-entries-from-compilation');
var getWorkboxSWImports = require('./lib/get-workbox-sw-imports');
var sanitizeConfig = require('./lib/sanitize-config');
var stringifyManifest = require('./lib/stringify-manifest');

var GenerateSW = function () {
  function GenerateSW() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, GenerateSW);

    this.config = (0, _assign2.default)({}, {
      chunks: [],
      excludeChunks: [],
      importScripts: [],
      importWorkboxFrom: 'cdn',
      swDest: 'service-worker.js'
    }, config);
  }

  (0, _createClass3.default)(GenerateSW, [{
    key: 'handleEmit',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(compilation) {
        var workboxSWImports, entries, manifestString, manifestAsset, manifestHash, manifestFilename, sanitizedConfig, serviceWorker;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                workboxSWImports = getWorkboxSWImports(compilation, this.config);
                entries = getManifestEntriesFromCompilation(compilation, this.config);
                manifestString = stringifyManifest(entries);
                manifestAsset = convertStringToAsset(manifestString);
                manifestHash = getAssetHash(manifestAsset);
                manifestFilename = 'precache-manifest.' + manifestHash + '.js';

                compilation.assets[manifestFilename] = manifestAsset;
                this.config.importScripts.push(manifestFilename);

                if (workboxSWImports) {
                  this.config.importScripts = this.config.importScripts.concat(workboxSWImports);
                }

                sanitizedConfig = sanitizeConfig.forGenerateSWString(this.config);

                sanitizedConfig.globPatterns = sanitizedConfig.globPatterns || [];
                _context.next = 13;
                return generateSWString(sanitizedConfig);

              case 13:
                serviceWorker = _context.sent;

                compilation.assets[this.config.swDest] = convertStringToAsset(serviceWorker);

              case 15:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function handleEmit(_x2) {
        return _ref.apply(this, arguments);
      }

      return handleEmit;
    }()
  }, {
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      compiler.plugin('emit', function (compilation, next) {
        _this.handleEmit(compilation).then(next).catch(next);
      });
    }
  }]);
  return GenerateSW;
}();

module.exports = GenerateSW;