import Model from '@ember-data/model';
import { fragment } from 'ember-data-model-fragments/attributes';
import { isPresent } from '@ember/utils';

/**
 * @class ResourceModel
 *
 * The base class for all blueprint resource models. The resource model gives
 * clients access to the resource stats.
 */
export default class ResourceModel extends Model {
  /// The stats for the resource. This attribute should never be serialized.
  @fragment('resource-stat', { serialize: false })
  _stat;

  /// Get the stats for the resource.
  get stat () {
    return this._stat;
  }

  /**
   * Test if the resource has stats.
   */
  get hasStat () {
    return isPresent (this._stat);
  }
}
