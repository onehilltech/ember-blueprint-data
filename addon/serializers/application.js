import RESTSerializer from '@ember-data/serializer/rest';
import MongoDB from '../mixins/serializers/mongodb';
import { dasherize } from '@ember/string';

export default RESTSerializer.extend (MongoDB, {
  payloadKeyFromModelName (modelName) {
    return dasherize (modelName);
  }
});
