import Mixin from '@ember/object/mixin';

import { underscore } from '@ember/string';
import { isPresent, isNone } from '@ember/utils';

import { singularize, pluralize } from 'ember-inflector';

export default Mixin.create ({
  primaryKey: '_id',

  /**
   * Get the key for an attribute by converting from underscores to
   * camel case.
   *
   * @param key
   * @return {*}
   */
  keyForAttribute: function (key) {
    return underscore (key);
  },

  /**
   * Serialize an attribute. Be default, we only serialize attributes that have changed.
   *
   * @param snapshot
   * @param json
   * @param key
   * @param attribute
   * @return {*}
   */
  serializeAttribute (snapshot, json, key, attribute) {
    const { options } = attribute;

    const changed = snapshot.changedAttributes ();

    if (isNone (changed[key])) {
      return;
    }

    // Check if the attribute is one that we never serialize in the request. If
    // we should not serialize the attribute, then we can just return.
    if (isPresent (options.serialize) && options.serialize === false) {
      return;
    }

    return this._super (snapshot, json, key, attribute);
  },

  /**
   * Serialize a belongs to relationship. We only serialize the relationship if there
   * is a change.
   *
   * @param snapshot
   * @param json
   * @param relationship
   */
  serializeBelongsTo (snapshot, json, relationship) {
    let key = relationship.key;
    let belongsTo = snapshot.belongsTo (key);

    key = this.keyForRelationship ? this.keyForRelationship (key, "belongsTo", "serialize") : key;

    if (!isNone (belongsTo)) {
      json[key] = belongsTo.id;
    }
  },

  /**
   * Normalize a query record response by converting the plural envelope to a
   * singular envelope.
   *
   * @param store
   * @param primaryModelClass
   * @param payload
   * @param id
   * @param requestType
   * @return {*}
   */
  normalizeQueryRecordResponse (store, primaryModelClass, payload, id, requestType) {
    let plural = pluralize (primaryModelClass.modelName);
    let singular = singularize (primaryModelClass.modelName);

    payload[singular] = payload[plural][0];

    delete payload[plural];

    return this._super (store, primaryModelClass, payload, id, requestType);
  }
});
