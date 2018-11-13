export default {
  search (store, type, query) {
    let url = this.buildURL (type.modelName, null, null, 'search', query);
    url += '/search';

    return this.ajax (url, 'POST', {
      data: {
        search: {
          query
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