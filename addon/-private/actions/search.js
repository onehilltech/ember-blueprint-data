import { assert } from '@ember/debug';

import { normalizeResponseHelper } from './serializer-response';
import { serializerForAdapter } from './serializers';

export default function (adapter, store, modelName, query, recordArray, options, directives) {

  let modelClass = store.modelFor (modelName); // adapter.search needs the class

  let promise;
  let createRecordArray = adapter.search.length > 3 || (adapter.search.wrappedFunction && adapter.search.wrappedFunction.length > 3);

  if (createRecordArray) {
    recordArray = recordArray || store.recordArrayManager.createAdapterPopulatedRecordArray (modelName, query);
    promise = Promise.resolve().then (() => adapter.search (store, modelClass, query, recordArray, options, directives));
  }
  else {
    promise = Promise.resolve().then (() => adapter.search (store, modelClass, query));
  }

  //let label = `DS: Handle Adapter#search of ${modelName}`;
  //promise = guardDestroyedStore(promise, store, label);


  return promise.then(
    adapterPayload => {
      //let serializerToken = heimdall.start('initial-serializerFor-lookup');
      let serializer = serializerForAdapter (store, adapter, modelName);
      //heimdall.stop(serializerToken);
      //let normalizeToken = heimdall.start('finders#_query::normalizeResponseHelper');
      let payload = normalizeResponseHelper(
        serializer,
        store,
        modelClass,
        adapterPayload,
        null,
        'query'
      );
      //heimdall.stop(normalizeToken);
      let internalModels = store._push(payload);

      assert(
        'The response to store.query is expected to be an array but it was a single record. Please wrap your response in an array or use `store.queryRecord` to query for a single record.',
        Array.isArray(internalModels)
      );

      if (recordArray) {
        recordArray._setInternalModels(internalModels, payload);
      }
      else {
        recordArray = store.recordArrayManager.createAdapterPopulatedRecordArray(
          modelName,
          query,
          internalModels,
          payload
        );
      }

      return recordArray;
    },
    null,
    `DS: Extract payload of search ${modelName}`
  );
}
