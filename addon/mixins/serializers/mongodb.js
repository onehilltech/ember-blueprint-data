import Mixin from '@ember/object/mixin';

import { underscore } from '@ember/string';
import { isEmpty, isPresent, isNone } from '@ember/utils';

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
   * Get the key for an relationship by converting from underscores to
   * camel case.
   *
   * @param key
   * @return {*}
   */
  keyForRelationship: function (key) {
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
    const { options: { serialize }, isFragment } = attribute;

    const changed = snapshot.changedAttributes ();

    if (serialize === 'always' || (isFragment && serialize !== false) || isPresent (changed[key])) {
      this._super (...arguments);
    }

    if (isFragment && serialize !== false) {
      // When dealing with a fragment, we delete the value if there is no
      // serialized data. Otherwise, we end up with a bunch of empty nested
      // objects.

      let payloadKey = this._getMappedKey (key, snapshot.type);

      if (payloadKey === key && this.keyForAttribute) {
        payloadKey = this.keyForAttribute (key, 'serialize');
      }

      let payload = json[payloadKey];

      if (isNone (payload) || (isPresent (payload) && isEmpty (Object.keys (payload)))) {
        delete json[payloadKey];
      }
    }
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

    if (isPresent (payload[plural])) {
      let [value] = payload[plural];

      if (isPresent (value)) {
        payload[singular] = value;
      }

      delete payload[plural];
    }

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
      const modelName = this.modelNameFromPayloadKey (key);
      const Model = store.modelFor (modelName);

      // We only care about the relationships in for for this model at this point. We need to
      // flatten those that are objects in the payload into reference ids.

      let values = payload[key];

      Model.eachRelationship (relationshipName => {
        let relationship = Model.relationshipsByName.get (relationshipName);
        let referencesName = pluralize (relationship.type);
        let serializer = store.serializerFor (relationship.type);
        let primaryKey = serializer.primaryKey;
        let relationshipKey = serializer.keyForRelationship (relationship.key, relationship, 'deserialize');

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

              if (isNone (value[relationshipKey])) {
                return value;
              }

              value[relationshipKey] = value[relationshipKey].map (handleRef);
              break;

            case 'belongsTo':
              if (isNone (value[relationshipKey])) {
                return value;
              }

              value[relationshipKey] = handleRef (value[relationshipKey]);

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
