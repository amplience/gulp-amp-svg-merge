// through2 is a thin wrapper around node transform streams
import through from 'through2';
import fs from 'fs';
import path from 'path';
import xmldom from 'xmldom';

import _forEach from 'lodash.foreach';
import gutil from 'gulp-util';

const Dom = xmldom.DOMParser;
const xmlSerializer = new xmldom.XMLSerializer();
const PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-amp-svg-merge';

const errorHandler = {
  errorHandler: {
    warning(warn) {
      gutil.log(`${PLUGIN_NAME}: Merge warning: ${warn}`);
    },
    error(error) {
      gutil.log(`${PLUGIN_NAME}: Merge error:  ${error}`);
    },
    fatalError(fatal) {
      gutil.log(`${PLUGIN_NAME}: Merge fatal error:  ${fatal}`);
    }
  }
};

function getFile(filename) {
  let metadataFile;

  try {
    metadataFile = fs.readFileSync(filename, 'utf-8');
  } catch (e) {
    //gutil.log(`${PLUGIN_NAME}: No merge file found: ${e}');
  }

  return metadataFile;
}

function mergeMetadata(file, metadata) {
  let svgDom = new Dom(errorHandler).parseFromString(file, 'application/xml');
  let metadataDom = new Dom(errorHandler).parseFromString(metadata, 'application/xml');
  let metadataElement = svgDom ? svgDom.getElementsByTagName('metadata')[0] : null;
  let svgElement = svgDom.getElementsByTagName('svg')[0];

  if (!svgElement|| !metadataDom || !svgDom) {
    gutil.log(`${PLUGIN_NAME}: Error merging metadata. Files are missing data or invalid.`);
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
  let svgDom = new Dom(errorHandler).parseFromString(file, 'application/xml');
  let headersDom = new Dom(errorHandler).parseFromString(headers, 'application/xml');
  let svgElement = svgDom ? svgDom.getElementsByTagName('svg')[0] : null;
  let headerSvgElement = headersDom ? headersDom.getElementsByTagName('svg')[0] : null;

  if (!headersDom || !svgDom || !svgElement) {
    gutil.log(`${PLUGIN_NAME}: Error merging headers. Files are missing data or invalid.`);
    return '';
  }

  if (headerSvgElement.hasAttributes()) {
    _forEach(headerSvgElement.attributes, attr => {
      svgElement.setAttribute(attr.name, attr.value);
    });
  }

  return xmlSerializer.serializeToString(svgDom);
}

// Plugin level function(dealing with files)
function gulpAmpSvgMerge(opts) {
  const options = {
    svgDir: opts.svgDirectory || './svg',
    subsFileExt: opts.subsFileExt || '.metadata',
    headerFileExt: opts.headerFileExt || '.headers'
  };

  return through.obj((file, enc, cb) => {
    if (file.isNull()) {
      // return empty file
      return cb(null, file);
    }

    const metadataFile = getFile(path.join(options.svgDir, file.relative + options.subsFileExt));
    const headerFile = getFile(path.join(options.svgDir, file.relative + options.headerFileExt));
    let contents = file.contents.toString();

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
