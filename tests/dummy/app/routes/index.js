import Route from '@ember/routing/route';

export default Route.extend({
  model () {

    return this.store.search ('author', {$or: [{name: 'Jack Black'}, {name: 'Todd Hill'} ]});
  }
});
