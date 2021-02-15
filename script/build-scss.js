'use strict';
const FS = require('fs')
    , PATH = require('path')
    , sass = require('sass')
    , postcss = require('postcss')
    , autoprefixer = require('autoprefixer')
    , cssnano = require('cssnano')({
    preset: [
        'default', {
            discardComments: {removeAll: true},
            normalizeUnicode: false
        }
    ]
})
    , sassOption = {
    outputStyle: 'expanded',
    indentType: 'space',
    indentWidth: 2,
    sourceMap: true,
    omitSourceMapUrl: true,
    sourceMapContents: true,
    sourceMapEmbed: false
}
    , encoding = 'utf8'
    , input = PATH.join(__dirname, '../src/style/index.scss')
    , outDir = PATH.join(__dirname, '../dist');

if (!FS.existsSync(outDir)) {
    FS.mkdirSync(outDir, {recursive: true});
}

const css = sass.renderSync(Object.assign({
    file: input,
    outFile: PATH.join(outDir, 'index.css')
}, sassOption));

let path = PATH.join(outDir, 'index.min.css');
postcss([autoprefixer, cssnano])
    .process(css.css, {
        from: input,
        to: path,
        map: {
            inline: false,
            sourcesContent: true,
            annotation: true,
            prev: css.map.toString()
        }
    })
    .then(processed => {
        FS.existsSync(path) && FS.unlinkSync(path);
        FS.writeFileSync(path, processed.css, encoding);

        path = PATH.join(outDir, 'index.min.css.map');
        FS.existsSync(path) && FS.unlinkSync(path);
        FS.writeFileSync(path, processed.map.toString(), encoding);
    });
