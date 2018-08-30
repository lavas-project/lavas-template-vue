#!/bin/bash

files=(
    './assets'
    './components'
    './core'
    './pages'
    './static'
    './store'
    './test'
    './.babelrc'
    './.editorconfig'
    './.fecsignore'
    './.fecsrc'
    './.postcssrc.js'
    './.travis.yml'
    './lavas.config.js'
    './LICENSE'
    './meta.json'
    './package.json'
    './README.md'
    './server.dev.js'
    './server.prod.js'
)
file=''
for i in ${files[@]}; do
    file=$file$i' '
done

tar -zcvf template.tar.gz $file
baidubce bos --put-object template.tar.gz bos://assets/lavas/baisc/templates.tar.gz
