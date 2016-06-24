/* eslint max-nested-callbacks: ["error", 10] */

import chai from 'chai';
import rimraf from 'rimraf';
import path from 'path';
import fs from 'fs';
import File from 'vinyl';
import ampSvgMerge from '../src';

const expect = chai.expect;

describe('ampSvgMerge()', function() {
  before(function() {
    rimraf.sync('tmp');
  });

  describe('metadata merge', function() {

    it('should output an SVG when no existing metadata and we provide valid metadata', function(done) {
      const svgNoMetaPath = path.join(__dirname, 'fixtures', 'metadata', 'main-no-metadata.svg')
      const file = new File({
        path: svgNoMetaPath,
        contents: fs.readFileSync(svgNoMetaPath)
      });

      const check = function (stream, done, cb) {
        stream.on('data', function (newFile) {
          cb(newFile);
          done();
        });

        stream.write(file);
        stream.end();
      };
      const stream = ampSvgMerge({
        svgDirectory: './',
        subsFileExt: '.metadata'
      });

      check(stream, done, (newFile) => {
        expect(String(newFile.contents)).to.equal(
          fs.readFileSync(path.join(__dirname, 'fixtures', 'expected', 'main-no-metadata-merge.svg'), 'utf8')
        );
      });
    });

    it('should output an SVG when metadata already exists and we provide valid metadata', function(done) {
      const svgMetaPath = path.join(__dirname, 'fixtures', 'metadata', 'main-metadata.svg')
      const file = new File({
        path: svgMetaPath,
        contents: fs.readFileSync(svgMetaPath)
      });

      const check = function (stream, done, cb) {
        stream.on('data', (newFile) => {
          cb(newFile);
          done();
        });

        stream.write(file);
        stream.end();
      };
      const stream = ampSvgMerge({
        svgDirectory: './',
        subsFileExt: '.metadata'
      });

      check(stream, done, (newFile) => {
        expect(String(newFile.contents)).to.equal(
          fs.readFileSync(path.join(__dirname, 'fixtures', 'expected', 'main-metadata-merge.svg'), 'utf8')
        );
      });
    });

    it('should output an SVG when an empty metadata already exists and we provide valid metadata', function(done) {
      const svgMetaPath = path.join(__dirname, 'fixtures', 'metadata', 'main-empty-metadata.svg')
      const file = new File({
        path: svgMetaPath,
        contents: fs.readFileSync(svgMetaPath)
      });

      const check = function (stream, done, cb) {
        stream.on('data', (newFile) => {
          cb(newFile);
          done();
        });

        stream.write(file);
        stream.end();
      };
      const stream = ampSvgMerge({
        svgDirectory: './',
        subsFileExt: '.metadata'
      });

      check(stream, done, (newFile) => {
        expect(String(newFile.contents)).to.equal(
          fs.readFileSync(path.join(__dirname, 'fixtures', 'expected', 'main-empty-metadata-merge.svg'), 'utf8')
        );
      });
    });

    it('should output an SVG when merged with metadata and headers', function(done) {
      const svgMetaPath = path.join(__dirname, 'fixtures', 'metadata', 'main-metadata-header.svg')
      const file = new File({
        path: svgMetaPath,
        contents: fs.readFileSync(svgMetaPath)
      });

      const check = function (stream, done, cb) {
        stream.on('data', (newFile) => {
          cb(newFile);
          done();
        });

        stream.write(file);
        stream.end();
      };
      const stream = ampSvgMerge({
        svgDirectory: './',
        subsFileExt: '.metadata',
        headerFileExt: '.headers'
      });

      check(stream, done, (newFile) => {
        expect(String(newFile.contents)).to.equal(
          fs.readFileSync(path.join(__dirname, 'fixtures', 'expected', 'main-metadata-header-merge.svg'), 'utf8')
        );
      });
    });

    it('should return an empty file when an invalid SVG is provided', function(done) {
      const svgMetaPath = path.join(__dirname, 'fixtures', 'metadata', 'main-metadata-invalid.svg')
      const file = new File({
        path: svgMetaPath,
        contents: fs.readFileSync(svgMetaPath)
      });
      const check = function (stream, done, cb) {
        stream.on('data', (newFile) => {
          cb(newFile);
          done();
        });
        stream.on('error', (error) => {
          console.log('error', error);
        })

        stream.write(file);
        stream.end();
      };
      const stream = ampSvgMerge({
        svgDirectory: './',
        subsFileExt: '.metadata'
      });

      check(stream, done, (newFile) => {
        expect(String(newFile.contents)).to.equal(
          fs.readFileSync(path.join(__dirname, 'fixtures', 'expected', 'main-metadata-invalid-merge.svg'), 'utf8')
        );
      });
    });
  });
});
