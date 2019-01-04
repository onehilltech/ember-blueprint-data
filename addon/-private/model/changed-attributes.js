import { merge } from '@ember/polyfills';

/**
 * Polyfill for adding change belongsTo relationships to the changed attributes. This
 * answer was adapted from:
 *
 *   https://github.com/emberjs/data/issues/3045#issuecomment-336649072
 */
export default {
  // this could break at the drop of a hat, so we'll want to test it thoroughly
  changedAttributes () {
    const attributes = this._super(...arguments);
    const relationships = {};

    // check relationships
    this.eachRelationship ((name, meta) => {
      if (meta.kind === 'belongsTo') {

        let before = this.get(`_internalModel._relationships.initializedRelationships.${name}.canonicalState.id`)
        let now = this.get(`${name}.id`);

        if (before !== now) {
          relationships[name] = [before, now]
        }
      }
    });

    return merge (attributes, relationships)
  }
}