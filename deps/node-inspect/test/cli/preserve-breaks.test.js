'use strict';
const Path = require('path');

const { test } = require('tap');

const startCLI = require('./start-cli');

test('run after quit / restart', (t) => {
  const script = Path.join('examples', 'three-lines.js');
  const cli = startCLI([script]);

  function onFatal(error) {
    cli.quit();
    throw error;
  }

  return cli.waitFor(/break/)
    .then(() => cli.waitForPrompt())
    .then(() => cli.command('breakpoints'))
    .then(() => {
      t.match(cli.output, 'No breakpoints yet');
    })
    .then(() => cli.command('sb(2)'))
    .then(() => cli.command('sb(3)'))
    .then(() => cli.command('breakpoints'))
    .then(() => {
      t.match(cli.output, `#0 ${script}:2`);
      t.match(cli.output, `#1 ${script}:3`);
    })
    .then(() => cli.stepCommand('c')) // hit line 2
    .then(() => cli.stepCommand('c')) // hit line 3
    .then(() => {
      t.match(cli.output, `break in ${script}:3`);
    })
    .then(() => cli.command('restart'))
    .then(() => cli.waitFor([/break in examples/, /breakpoints restored/]))
    .then(() => cli.waitForPrompt())
    .then(() => {
      t.match(cli.output, `break in ${script}:1`);
    })
    .then(() => cli.stepCommand('c'))
    .then(() => {
      t.match(cli.output, `break in ${script}:2`);
    })
    .then(() => cli.stepCommand('c'))
    .then(() => {
      t.match(cli.output, `break in ${script}:3`);
    })
    .then(() => cli.command('breakpoints'))
    .then(() => {
      t.match(cli.output, `#0 ${script}:2`);
      t.match(cli.output, `#1 ${script}:3`);
    })
    .then(() => cli.quit())
    .then(null, onFatal);
});
