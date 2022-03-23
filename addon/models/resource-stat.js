import { attr } from '@ember-data/model';
import MF from 'ember-data-model-fragments';

export default class ResourceStatFragment extends MF.Fragment {
  /// The date the resource was created.
  @attr('date')
  createdAt;

  /// The date the resource was updated.
  @attr('date')
  updatedAt;

  /// The date the resource was deleted.
  @attr('date')
  deletedAt;

  get isUpdated () {
    return !!this.updatedAt;
  }

  get isDeleted () {
    return !!this.deletedAt;
  }
}
