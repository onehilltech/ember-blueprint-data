/* eslint-env node */

const { Blueprint } = require ('ember-cli-blueprint-helpers');

module.exports = Blueprint.extend ({
  addons: [
    { name: 'ember-data-model-fragments' },
    { name: 'ember-compatibility-helpers' }
  ]
});
