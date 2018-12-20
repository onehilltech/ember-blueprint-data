import EmberObject from '@ember/object';
import { bool } from '@ember/object/computed';

export default EmberObject.extend ({
  createdAt: null,

  updatedAt: null,

  deletedAt: null,

  isUpdated: bool ('updatedAt'),

  isDeleted: bool ('deletedAt')
});
