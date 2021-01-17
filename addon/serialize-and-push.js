export default function serializeAndPush (options = {}) {
  return function (response) {
    const modelClass = this.constructor;
    const { model: modelName = modelClass.modelName, requestType } = options;
    const serializer = this.store.serializerFor (modelName);

    let normalized = serializer.normalizeResponse (this.store, modelClass, response, null, requestType);

    return this.store.push (normalized);
  }
}