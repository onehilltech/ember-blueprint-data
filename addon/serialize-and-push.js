export default function serializeAndPush (options = {}) {
  return function (response) {
    const {
      model: modelName = this.constructor.modelName,
      requestType = 'findRecord'
    } = options;

    const serializer = this.store.serializerFor (modelName);
    const modelClass = this.store.modelFor (modelName) || this.constructor;

    let normalized = serializer.normalizeResponse (this.store, modelClass, response, null, requestType);

    return this.store.push (normalized);
  }
}