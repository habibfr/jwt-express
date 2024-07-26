export default class ZodValidator {
  static validate(schema, dataObject) {
    try {
      return schema.parse(dataObject);
    } catch (error) {
      return { errors: error.errors };
    }
  }
}
