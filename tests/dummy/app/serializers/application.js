import DS from 'ember-data';
import MongoDB from 'ember-blueprint-data/mixins/serializers/mongodb';

export default DS.RESTSerializer.extend (MongoDB, {

});
