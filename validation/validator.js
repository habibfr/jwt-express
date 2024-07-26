import { ZodObject } from "zod";

export default class ZodValidator {
  /**
   *
   * @param {ZodObject} schema
   * @param { Object } dataObject
   * @returns {Object | null}
   *
   *
   * Method validate digunakan untuk melakukan validasi,
   * menerima 2 parameter source dan dataObject. Source adalah object skema validasi dan dataObject adalah data yang akan di validasi
   */
  static validate(schema, dataObject) {
    const result = schema.safeParse(dataObject);
    if (!result.success) {
      return { errors: result.error.errors };
    }
    return result.data;
  }
}
