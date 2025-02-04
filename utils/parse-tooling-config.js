'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to get dynamic service keys for stripping
 */
const getDynamicKeys = (answer, answers = {}) => _(answers)
  .map((value, key) => ({key, value}))
  .filter(data => data.value === answer)
  .map(data => data.key)
  .map(key => (_.size(key) === 1) ? `-${key}` : `--${key}`)
  .value();

/*
 * Helper to handle dynamic services
 *
 * Set SERVICE from answers and strip out that noise from the rest of
 * stuff, check answers/argv for --service or -s, validate and then remove
 */
const handleDynamic = (config, argv, options = {}, answers = {}, execs = {}) => {
  if (_.startsWith(config.service, ':')) {
    const answer = answers[config.service.split(':')[1]];
    // Remove dynamic service option from argv
    _.remove(argv, arg => _.includes(getDynamicKeys(answer, answers).concat(answer), arg));
    // get the service
    const service = answers[config.service.split(':')[1]];
    // Return updated config
    return _.merge({}, config, {exec: execs[service] ?? false, service});
  } else {
    return config;
  }
};

/*
 * Helper to process args
 *
 * We assume pass through commands so let's use argv directly and strip out
 * the first three assuming they are [node, lando.js, options.name]'
 * Check to see if we have global lando opts and remove them if we do
 */
const handleOpts = (config, name, argv, argopts = []) => {
  // Append any user specificed opts
  argopts = argopts.concat(argv.slice(argv.findIndex(value => value === name.split(' ')[0]) + 1));
  // If we have no args then just return right away
  if (_.isEmpty(argopts)) return config;
  // Return
  return _.merge({}, config, {args: argopts});
};

/*
 * Helper to get passthru options
 */
const handlePassthruOpts = (options = {}, answers = {}) => _(options)
  .map((value, key) => _.merge({}, {name: key}, value))
  .filter(value => value.passthrough === true && !_.isNil(answers[value.name]))
  .map(value => `--${value.name}=${answers[value.name]}`)
  .value();

/*
 * Helper to convert a command into config object
 */
const parseCommand = (cmd, service, execs) => ({
  exec: execs[service] ?? false,
  command: (_.isObject(cmd)) ? cmd[_.first(_.keys(cmd))] : cmd,
  service: (_.isObject(cmd)) ? _.first(_.keys(cmd)) : service,
});

// adds required methods to ensure the lando v3 debugger can be injected into v4 things
module.exports = (cmd, service, name, options = {}, answers = {}, execs = {}) => _(cmd)
  // Put into an object so we can handle "multi-service" tooling
  .map(cmd => parseCommand(cmd, service, execs))
  // Handle dynamic services
  .map(config => handleDynamic(config, answers._eventArgs ?? process.argv, options, answers, execs))
  // Add in any argv extras if they've been passed in
  .map(config => handleOpts(config, name, answers._eventArgs ?? process.argv, handlePassthruOpts(options, answers)))
  // Wrap the command in /bin/sh if that makes sense
  .map(config => _.merge({}, config, {command: require('./shell-escape')(config.command, true, config.args, config.exec)})) // eslint-disable-line max-len
  // Add any args to the command and compact to remove undefined
  .map(config => _.merge({}, config, {command: _.compact(config.command.concat(config.args))}))
  // Put into an object
  .value();
