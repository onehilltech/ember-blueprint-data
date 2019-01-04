import DS from 'ember-data';

import SearchMixin from '../-private/store/search';
import RESTAdapterMixin from '../-private/adapters/rest';
import ChangedAttributesMixin from '../-private/model/changed-attributes';

export function initialize () {
  DS.Store.reopen (SearchMixin);
  DS.RESTAdapter.reopen (RESTAdapterMixin);
  DS.Model.reopen (ChangedAttributesMixin);
}

export default {
  initialize
};
