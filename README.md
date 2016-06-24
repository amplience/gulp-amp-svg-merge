# gulp-amp-svg-merge
> Gulp plugin for merging Amplience SVG metadata into SVG files

## Installation

```sh
$ npm install --save svg-metadata-merge
```

## Usage

```js
var ampSvgMerge = require('gulp-amp-svg-merge');

gulp.src('svg/*.svg')
    .pipe(ampSvgMerge({
      svgDir: './svg',
      subsFileExt: '.metadata',
      headerFileExt: '.header'
    }))
    .pipe(gulp.dest('svg/merged'));
```

## Options

`svgDir` - location of the metadata and header files.

`subsFileExt` - file extension to identify the metadata substitutions file.

`headerFileExt` - file extension to identify the header attributes file.

The metadata and header files much have the same filename as the target SVG (plus the additional file extension identifier).


## Example SVG
These examples are a guide to what should be provided to the module and what the expected output will be.
### Input SVG
The input file should be a valid SVG file like this:
```xml
<svg version="1.1" xmlns:svg="http://www.w3.org/2000/svg"
   xmlns:ampsvg="http://media.amplience.com/2016/svg-extensions"
   xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="200px"
	 height="200px" viewBox="0 0 200 200" enable-background="new 0 0 200 200" xml:space="preserve">

  <metadata>
  </metadata>
  <polygon points="19,6.4 17.6,5 12,10.6 6.4,5 5,6.4 10.6,12 5,17.6 6.4,19 12,13.4 17.6,19 19,17.6 13.4,12"/>
</svg>
```
Or if there is existing metadata:
```xml
<svg version="1.1" xmlns:svg="http://www.w3.org/2000/svg"  xmlns:ampsvg="http://media.amplience.com/2016/svg-extensions"
   xmlns:nonamp="http://media.amplience.com/2016/svg-extensions"
   xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="200px"
	 height="200px" viewBox="0 0 200 200" enable-background="new 0 0 200 200" xml:space="preserve">

  <metadata>
    <nonamp:stuff>
      <nonamp:substitutions type="test-type" value="I am a test">
      </nonamp:substitutions>
    </nonamp:stuff>
  </metadata>
  <polygon points="19,6.4 17.6,5 12,10.6 6.4,5 5,6.4 10.6,12 5,17.6 6.4,19 12,13.4 17.6,19 19,17.6 13.4,12"/>
</svg>
```

### Metadata
A metadata file can be created to merge in Amplience specific metadata. The contents of the metadata file should look like this:
```xml
<ampsvg:metadata>
    <ampsvg:substitutions>
        <ampsvg:substitute type="set-innerText" target="//svg:text[@id='text01']" value="10% off" />
    </ampsvg:substitutions>
    <ampsvg:fonts>
        <ampsvg:font font-family="/playground/Roboto" />
    </ampsvg:fonts>
</ampsvg:metadata>
```
Note: `<metadata>` should not be included in this file.

### Headers
A header file can be created to merge in svg element attributes.  Th file should contain:
```xml
<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns:ampsvg="http://media.amplience.com/2016/svg-extensions" width="200px" height="200px" viewBox="0 0 200 200"></svg>
```

## License

Apache-2.0 © [Amplience](http://amplience.com/)
