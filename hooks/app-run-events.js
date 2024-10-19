'use strict';

const _ = require('lodash');
const remove = require('../utils/remove');
const path = require('path');

module.exports = async (app, lando, cmds, data, event) => {
  const eventCommands = require('./../utils/parse-events-config')(cmds, app, data, lando);
  // add perm sweeping to all v3 services
  if (!_.isEmpty(eventCommands)) {
    const permsweepers = _(eventCommands)
      .filter(command => command.api === 3)
      .map(command => ({id: command.id, services: _.get(command, 'opts.services', [])}))
      .uniqBy('id')
      .value();
    lando.log.debug('added preemptive perm sweeping to evented v3 services %j', permsweepers.map(s => s.id));
    _.forEach(permsweepers, ({id, services}) => {
      eventCommands.unshift({
        id,
        cmd: '/helpers/user-perms.sh --silent',
        compose: app.compose,
        project: app.project,
        opts: {
          mode: 'attach',
          user: 'root',
          services,
        },
      });
    });
  }
  const injectable = _.has(app, 'engine') ? app : lando;
  return injectable.engine.run(eventCommands).catch(err => {
    const command = _.tail(event.split('-')).join('-');
    if (app.addMessage) {
      const message = _.trim(_.get(err, 'message')) || 'UNKNOWN ERROR';
      app.addMessage({
        title: `The ${event} event has command(s) that failed!`,
        type: 'warning',
        detail: [
          `Event failed with: "${message}"`,
          'This **MAY** prevent your app from working.',
          'Check for errors above, fix them in your Landofile, and run the command again:',
        ],
        command: `lando ${command}`,
      }, err);
    } else {
      lando.exitCode = 12;
    }
  }).finally(() => {
    const run = _.first(
      _.filter(eventCommands, eventCommand => true === eventCommand.isInitEventCommand),
    );

    run.opts = {purge: true, mode: 'attach'};
    return injectable.engine.stop(run)
      .then(() => injectable.engine.destroy(run))
      .then(() => remove(path.dirname(run.compose[0])));
  });
};
