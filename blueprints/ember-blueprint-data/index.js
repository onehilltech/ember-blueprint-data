/* eslint-env node */

const { Blueprint } = require ('ember-cli-blueprint-helpers');

module.exports = Blueprint.extend ({
  addons: [
    { name: 'ember-data-model-fragments', target: '^6.0.0' },
  ]
});
