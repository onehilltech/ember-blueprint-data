import DS from 'ember-blueprint-data';

export default DS.Resource.extend ({
  firstName: DS.attr ('string'),

  lastName: DS.attr ('string'),

  email: DS.attr ('string'),

  favoriteAuthor: DS.belongsTo ('author'),

  randomId: DS.attr (),

  blacklist: DS.hasMany ('author'),

  bookstore: DS.belongsTo ('bookstore'),

  bookstores: DS.hasMany ('bookstore')
});
