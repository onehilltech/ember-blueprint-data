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

  normalizeSingleResponse (store, primaryModelClass, payload, id, requestType) {
    // Let the base class create the default response.
    let response = this._super (store, primaryModelClass, this._normalizePayload (store, payload), id, requestType);
    return this._includeResourceStats (response, store, primaryModelClass, payload);
  },

  normalizeArrayResponse(store, primaryModelClass, payload, id, requestType) {
    let response = this._super (store, primaryModelClass, this._normalizePayload (store, payload), id, requestType);
    return this._includeResourceStats (response, store, primaryModelClass, payload);
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
    let [value] = payload[plural];

    if (isPresent (value)) {
      payload[singular] = value;
    }

    delete payload[plural];

    return this._super (store, primaryModelClass, payload, id, requestType);
  },

  /**
   * Include the resource stats in the data models.
   *
   * @param response
   * @param store
   * @param primaryModelClass
   * @param payload
   * @returns {*}
   * @private
   */
  _includeResourceStats (response, store, primaryModelClass, payload) {
    const keys = Object.keys (payload);

    for (let i = 0; i < keys.length; ++ i) {
      const key = keys[i];
      const singular = singularize (key);
      const isPrimaryType = this.isPrimaryType (store, singular, primaryModelClass);

      if (isPrimaryType) {
        let resource = payload[key];

        if (isPresent (resource)) {
          if (Array.isArray (resource)) {
            resource.forEach ((rc, i) => {
              if (!!rc._stat)
                response.data[i].attributes.stat =  this._normalizeResourceStat (rc._stat);
            });
          }
          else {
            if (!!resource._stat)
              response.data.attributes.stat = this._normalizeResourceStat (resource._stat);
          }
        }

        break;
      }
    }

    return response;
  },

  _normalizeResourceStat (payload) {
    let stat = {};

    if (payload.created_at) {
      stat.createdAt = new Date (payload.created_at);
    }

    if (payload.updated_at) {
      stat.updatedAt = new Date (payload.updated_at);
    }

    if (payload.deleted_at) {
      stat.deletedAt = new Date (payload.deleted_at);
    }

    return stat;
  },

  /**
   * Normalize the payload for processing.
   *
   * @param store
   * @param payload
   */
  _normalizePayload (store, payload) {
    let keys = Object.keys (payload);
    let references = {};

    keys.forEach (key => {
      const modelName = singularize (key);
      const Model = store.modelFor (modelName);

      // We only care about the relationships in for for this model at this point. We need to
      // flatten those that are objects in the payload into reference ids.

      let values = payload[key];

      Model.eachRelationship (relationshipName => {
        let relationship = Model.relationshipsByName.get (relationshipName);
        let referencesName = pluralize (relationship.type);
        let serializer = store.serializerFor (relationship.type);
        let primaryKey = serializer.primaryKey;

        function normalize (value) {
          function handleRef (ref) {
            if (typeof ref !== 'object' || ref === null || !!ref.type)
              return ref;

            // Replace the object with a reference id.
            let refId = ref[primaryKey];
            (references[referencesName] = references[referencesName] || []).push (ref);

            return refId;
          }

          if (isNone (value)) {
            return value
          }

          switch (relationship.kind) {
            case 'hasMany':
              // The reference is a collection of references. We need to iterate over each entry
              // in the references and flatten it accordingly.

              if (isNone (value[relationship.key])) {
                return value;
              }

              value[relationship.key] = value[relationship.key].map (handleRef);
              break;

            case 'belongsTo':
              if (isNone (value[relationship.key])) {
                return value;
              }

              value[relationship.key] = handleRef (value[relationship.key]);

              break;
          }

          return value;
        }

        if (Array.isArray (values)) {
          // Iterate over each value in the payload and process this relationship.
          payload[key] = values.map (normalize);
        }
        else {
          payload[key] = normalize (values);
        }
      });
    });

    // Include the references in the payload.
    if (Object.keys (references).length === 0)
      return Object.assign ({}, payload, references);

    return Object.assign ({}, payload, references, this._normalizePayload (store, references));
  }
});
