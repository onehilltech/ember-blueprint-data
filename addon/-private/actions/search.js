import { assert } from '@ember/debug';

import { normalizeResponseHelper } from './serializer-response';
import { serializerForAdapter } from './serializers';
import { gte } from 'ember-compatibility-helpers';

export default function (adapter, store, modelName, query, recordArray, options, directives) {
  const modelClass = store.modelFor (modelName); // adapter.search needs the class
  let promise;

  if (gte ('ember-data', '4.7.0')) {
    recordArray = recordArray || store.recordArrayManager.createArray ({
      type: modelName,
      query
    });
  }
  else {
    const createRecordArray = adapter.search.length > 3 || (adapter.search.wrappedFunction && adapter.search.wrappedFunction.length > 3);

    if (createRecordArray) {
      recordArray = recordArray || store.recordArrayManager.createAdapterPopulatedRecordArray (modelName, query);
      promise = Promise.resolve().then (() => adapter.search (store, modelClass, query, recordArray, options, directives));
    }
    else {
      promise = Promise.resolve().then (() => adapter.search (store, modelClass, query));
    }
  }

  let label = `DS: Handle Adapter#search of ${modelName}`;
  promise = guardDestroyedStore(promise, store, label);

  return promise.then (adapterPayload => {
    if (gte ('ember-data', '4.7.0')) {
      const serializer = store.serializerFor (modelName);
      const payload = normalizeResponseHelper (serializer, store, modelClass, adapterPayload, null, 'query');
      const identifiers = store._push (payload);

      (!(Array.isArray(identifiers)) && debug.assert('The response to store.search is expected to be an array but it was a single record. Please wrap your response in an array or use `store.queryRecord` to query for a single record.', Array.isArray(identifiers)));
      store.recordArrayManager.populateManagedArray (recordArray, identifiers, payload);

      return recordArray;
    }
    else {
      const serializer = serializerForAdapter (store, adapter, modelName);
      const payload = normalizeResponseHelper(serializer, store, modelClass, adapterPayload, null,'query');
      const internalModels = store._push(payload);

      assert(
        'The response to store.search is expected to be an array but it was a single record. Please wrap your response in an array.',
        Array.isArray(internalModels)
      );

      const identifiers = internalModels.map (im => im.identifier);

      if (recordArray) {
        if (recordArray._setIdentifiers) {
          // This is for @ember-data 3.28 and greater.
          recordArray._setIdentifiers (identifiers, payload);
        }
        else {
          // _setInternalModels is for older version of @ember-data.
          recordArray._setInternalModels(internalModels, payload);
        }
      }
      else {
        recordArray = store.recordArrayManager.createAdapterPopulatedRecordArray(
          modelName,
          query,
          internalModels, // This will need to be identifiers in later versions of @ember-data
          payload
        );
      }

      return recordArray;
    }
  }, null, `DS: Extract payload of search ${modelName}`);
}
