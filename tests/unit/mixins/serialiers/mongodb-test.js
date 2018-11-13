import EmberObject from '@ember/object';
import SerialiersMongodbMixin from 'ember-blueprint-data/mixins/serialiers/mongodb';
import { module, test } from 'qunit';

module('Unit | Mixin | serialiers/mongodb', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let SerialiersMongodbObject = EmberObject.extend(SerialiersMongodbMixin);
    let subject = SerialiersMongodbObject.create();
    assert.ok(subject);
  });
});
