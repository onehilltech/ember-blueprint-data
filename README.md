# ember-blueprint-data

Support add-on for integrating Blueprint applications with ember-data.


## Compatibility

* Ember.js v4.4 or above
* Ember CLI v4.4 or above
* Node.js v14 or above


## Installation


    ember install ember-blueprint-data



MongoDB Support
------------------------------------------------------------------------------

The addon provides a mixin for `DS.RESTSerializer` that provides baseline behavior
for integrating with `blueprint-mongodb`. More specifially, the MongoDB mixin
provides the following functionality:

* It defines the `primaryKey` as `_id`.
* It only serializes attributes that have changed.
* It only serializes `belongsTo` relationships that exist, and have changed.
* It does not serialize attributes that have `serialize:false` as part of its attribute definition.
* It normalizes the `queryRecord` response by converting it from an array to a single value.
* It extends the `Store` and `RESTAdapter` with support for the `search()` action on a MongoDB `ResourceController`.

Use the MongoDB mixin by importing it into a serializer, such as the application
serializer, and applying it to the extended class.

```javascript
// app/serializers/application.js

import DS from 'ember-data';
import MongoDB from 'ember-blueprint-data/mixins/serializers/mongodb'

export default DS.RESTSerializer.extend (MongoDB, {

});
```

<<<<<<< HEAD
Happy Coding!
=======

## Usage

[Longer description of how to use the addon in apps.]


## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.


## License

This project is licensed under the [MIT License](LICENSE.md).
>>>>>>> 4fca2c9 (v3.18.0...v4.12.2)
