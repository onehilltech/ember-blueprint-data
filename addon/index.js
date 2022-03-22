import DS from 'ember-data';
import Resource from './resource';
import ResourceStat from './resource-stat';

DS.Resource = Resource;
DS.ResourceStat = ResourceStat;

export default DS;
export { default as serializeAndPush } from './serialize-and-push';
export { default as ResourceModel } from './resource';
