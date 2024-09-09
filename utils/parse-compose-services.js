'use strict';

// Modules
const _ = require('lodash');

// adds required methods to ensure the lando v3 debugger can be injected into v4 things
module.exports = (config, app) => _(config)
  // Arrayify
  .map((service, name) => _.merge({}, {name}))
  // Build the config and ensure api is set to 3
  .map(service => _.merge({}, service, {
    _app: app,
    app: app.name,
    home: app.config.home || app._config.home,
    project: app.project,
    root: app.root,
    type: '_lando',
    userConfRoot: app._config.userConfRoot,
    version: 'custom',
    api: 3,
  }))
  .value();
