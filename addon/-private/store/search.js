import DS from 'ember-data';

import { assert } from '@ember/debug';
import { isPresent } from '@ember/utils';

import _search from '../actions/search';

/**
 * Helper function to create an instance of a PromiseArray.
 *
 * @param promise
 * @param label
 */
function promiseArray (promise, label) {
  return DS.PromiseArray.create({
    promise: Promise.resolve (promise, label),
  });
}

export default {
  /**
   * Execute a search operation on the server.
   *
   * @param modelName
   * @param query
   * @param options
   * @param directives
   */
  search (modelName, query, options, directives) {
    assert(`You need to pass a model name to the store's search method`, isPresent(modelName));
    assert(`You need to pass a query hash to the store's search method`, query);
    assert(
      `Passing classes to store methods has been removed. Please pass a dasherized string instead of ${modelName}`,
      typeof modelName === 'string'
    );

    let adapterOptionsWrapper = {};

    if (options && options.adapterOptions) {
      adapterOptionsWrapper.adapterOptions = options.adapterOptions;
    }

    let normalizedModelName = DS.normalizeModelName (modelName);
    return this._search (normalizedModelName, query, null, adapterOptionsWrapper, directives);
  },

  _search (modelName, query, array, options, directives) {
    //let token = heimdall.start ('store._search');
    assert(`You need to pass a model name to the store's query method`, isPresent(modelName));
    assert(`You need to pass a query hash to the store's query method`, query);
    assert(
      `Passing classes to store methods has been removed. Please pass a dasherized string instead of ${modelName}`,
      typeof modelName === 'string'
    );

    //let modelToken = heimdall.start('initial-modelFor-lookup');
    //heimdall.stop(modelToken);

    //let adapterToken = heimdall.start('initial-adapterFor-lookup');
    let adapter = this.adapterFor(modelName);
    //heimdall.stop(adapterToken);

    assert(`You tried to load a query but you have no adapter (for ${modelName})`, adapter);
    assert(
      `You tried to load a query but your adapter does not implement 'query'`,
      typeof adapter.query === 'function'
    );

    return promiseArray (_search (adapter, this, modelName, query, array, options, directives));
  }
}