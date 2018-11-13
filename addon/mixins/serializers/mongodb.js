import Mixin from '@ember/object/mixin';
import { underscore } from '@ember/string';

export default Mixin.create ({
  primaryKey: '_id',

  keyForAttribute: function (key) {
    return underscore (key);
  }
});
