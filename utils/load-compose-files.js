'use strict';

const _ = require('lodash');
const Yaml = require('./../lib/yaml');
const path = require('path');
const yaml = new Yaml();
const fs = require('fs');

// This just runs `docker compose --project-directory ${dir} config -f ${files} --output ${outputPaths}` to
// make all paths relative to the lando config root
module.exports = async (files, dir, landoComposeConfigDir, outputConfigFunction) => {
  const composeFilePaths = _(require('./normalize-files')(files, dir)).value();
  if (_.isEmpty(composeFilePaths)) {
    return {};
  }

  const outputFile = path.join(landoComposeConfigDir, 'resolved-compose-config.yml');

  fs.mkdirSync(path.dirname(outputFile), {recursive: true});
  await outputConfigFunction(composeFilePaths, outputFile);
  const result = yaml.load(outputFile);
  fs.unlinkSync(outputFile);

  return result;
};
