// through2 is a thin wrapper around node transform streams
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _through2 = require('through2');

var _through22 = _interopRequireDefault(_through2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _xmldom = require('xmldom');

var _xmldom2 = _interopRequireDefault(_xmldom);

var _lodashForeach = require('lodash.foreach');

var _lodashForeach2 = _interopRequireDefault(_lodashForeach);

var _gulpUtil = require('gulp-util');

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

var Dom = _xmldom2['default'].DOMParser;
var xmlSerializer = new _xmldom2['default'].XMLSerializer();
var PluginError = _gulpUtil2['default'].PluginError;

var PLUGIN_NAME = 'gulp-amp-svg-merge';

var errorHandler = {
  errorHandler: {
    warning: function warning(warn) {
      _gulpUtil2['default'].log('Merge warning: ', warn);
    },
    error: (function (_error) {
      function error(_x) {
        return _error.apply(this, arguments);
      }

      error.toString = function () {
        return _error.toString();
      };

      return error;
    })(function (error) {
      _gulpUtil2['default'].log('Merge error: ', error);
    }),
    fatalError: function fatalError(fatal) {
      _gulpUtil2['default'].log('Merge fatal error: ', error);
    }
  }
};

function getFile(filename) {
  var metadataFile = undefined;

  try {
    metadataFile = _fs2['default'].readFileSync(filename, 'utf-8');
  } catch (e) {
    //gutil.log('No merge file found: ', e);
  }

  return metadataFile;
}

function mergeMetadata(file, metadata) {
  var svgDom = new Dom(errorHandler).parseFromString(file, 'application/xml');
  var metadataDom = new Dom(errorHandler).parseFromString(metadata, 'application/xml');
  var metadataElement = svgDom ? svgDom.getElementsByTagName('metadata')[0] : null;
  var svgElement = svgDom.getElementsByTagName('svg')[0];

  if (!svgElement || !metadataDom || !svgDom) {
    _gulpUtil2['default'].log('Error merging metadata. Files are missing data or invalid.');
    return '';
  }

  if (!metadataElement) {
    metadataElement = svgDom.createElement('metadata');
    svgElement.appendChild(metadataElement);
  }

  metadataElement.appendChild(metadataDom);

  return xmlSerializer.serializeToString(svgDom);
}

function mergeHeaders(file, headers) {
  var svgDom = new Dom(errorHandler).parseFromString(file, 'application/xml');
  var headersDom = new Dom(errorHandler).parseFromString(headers, 'application/xml');
  var svgElement = svgDom ? svgDom.getElementsByTagName('svg')[0] : null;
  var headerSvgElement = headersDom ? headersDom.getElementsByTagName('svg')[0] : null;

  if (!headersDom || !svgDom || !svgElement) {
    _gulpUtil2['default'].log('Error merging headers. Files are missing data or invalid.');
    return '';
  }

  if (headerSvgElement.hasAttributes()) {
    (0, _lodashForeach2['default'])(headerSvgElement.attributes, function (attr) {
      svgElement.setAttribute(attr.name, attr.value);
    });
  }

  return xmlSerializer.serializeToString(svgDom);
}

// Plugin level function(dealing with files)
function gulpAmpSvgMerge(opts) {
  var options = {
    svgDir: opts.svgDirectory || './svg',
    subsFileExt: opts.subsFileExt || '.metadata',
    headerFileExt: opts.headerFileExt || '.headers'
  };

  return _through22['default'].obj(function (file, enc, cb) {
    if (file.isNull()) {
      // return empty file
      return cb(null, file);
    }

    var metadataFile = getFile(_path2['default'].join(options.svgDir, file.relative + options.subsFileExt));
    var headerFile = getFile(_path2['default'].join(options.svgDir, file.relative + options.headerFileExt));
    var contents = file.contents.toString();

    if (metadataFile) {
      contents = mergeMetadata(contents, metadataFile);
    }
    if (headerFile) {
      contents = mergeHeaders(contents, headerFile);
    }

    if (file.isBuffer()) {
      file.contents = new Buffer(contents);
    }
    if (file.isStream()) {
      file.contents = file.contents.pipe(contents);
    }

    cb(null, file);
  });
}

module.exports = gulpAmpSvgMerge;