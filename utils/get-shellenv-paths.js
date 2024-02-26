'use strict';

const fs = require('fs');
const path = require('path');

module.exports = ({entrypoint, file, installPath}) => {
  return [entrypoint, file, installPath]
    .filter(p => typeof p === 'string' && p !== '')
    .map(p => !fs.lstatSync(p).isDirectory() ? path.dirname(p) : p)
    .filter(p => !process.env.PATH.split(path.delimiter).includes(p));
};
