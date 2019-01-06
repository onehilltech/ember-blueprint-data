export default {
  buildQuery (snapshot) {
    let query = this._super (...arguments);

    const { adapterOptions } = snapshot;

    if (adapterOptions) {
      // Handle the directives placed under the adapter options.

      let directives = {};

      if (adapterOptions.populate) {
        directives.populate = true;
      }

      if (Object.keys (directives).length) {
        query._ = directives;
      }
    }

    return query;
  },

  search (store, type, query, recordArray, options, directives) {
    const { adapterOptions } = options;

    let url = this.buildURL (type.modelName, null, null, 'search', query);
    url += '/search';

    return this.ajax (url, 'POST', {
      data: {
        search: {
          query,
          options: adapterOptions,
          _: directives
        }
      }
    });
  },

  urlForSearch (query, modelName) {
    return this._buildURL (modelName);
  },

  buildURL (modelName, id, snapshot, requestType, query) {
    switch (requestType) {
      case 'search':
        return this.urlForSearch (query, modelName);

      default:
        return this._super (...arguments);
    }
  }
}