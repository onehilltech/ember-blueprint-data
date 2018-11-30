import Mixin from '@ember/object/mixin';
import { underscore } from '@ember/string';

import { singularize, pluralize } from 'ember-inflector';

export default Mixin.create ({
  primaryKey: '_id',

  keyForAttribute: function (key) {
    return underscore (key);
  },

  normalizeQueryRecordResponse (store, primaryModelClass, payload, id, requestType) {
    let plural = pluralize (primaryModelClass.modelName);
    let singular = singularize (primaryModelClass.modelName);

    payload[singular] = payload[plural][0];

    delete payload[plural];

    return this._super (store, primaryModelClass, payload, id, requestType);
  }
});
