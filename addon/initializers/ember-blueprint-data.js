import DS from 'ember-data';

import SearchMixin from '../-private/store/search';
import RESTAdapterMixin from '../-private/adapters/rest';

export function initialize() {
  DS.Store.reopen (SearchMixin);
  DS.RESTAdapter.reopen (RESTAdapterMixin);
}

export default {
  initialize
};
