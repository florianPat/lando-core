'use strict';

const {EOL} = require('os');
const {Listr} = require('listr2');

// we do this to coax out the default renderer class so we can extend it
const listr = new Listr([], {renderer: 'default', fallbackRenderer: 'default'});

class LandoRenderer extends listr.rendererClass {
  constructor(tasks, options, $renderHook) {
    super(tasks, options, $renderHook);
    this.options.level = options.level || 0;
  }

  create(options) {
    options = {
      tasks: true,
      bottomBar: true,
      prompt: true,
      ...options,
    };

    const render = [];

    const renderTasks = this.renderer(this.tasks, this.options.level);
    const renderBottomBar = this.renderBottomBar();
    const renderPrompt = this.renderPrompt();

    if (options.tasks && renderTasks.length > 0) render.push(...renderTasks);

    if (options.bottomBar && renderBottomBar.length > 0) {
      if (render.length > 0) render.push('');
      render.push(...renderBottomBar);
    }

    if (options.prompt && renderPrompt.length > 0) {
      if (render.length > 0) render.push('');
      render.push(...renderPrompt);
    }

    return render.join(EOL);
  }
}

module.exports = LandoRenderer;
