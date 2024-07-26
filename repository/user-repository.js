import Users from "../models/user-model.js";

export default class UserRepository {
  static getUsers = async () => {
    return await Users.findAll({
      attributes: ["id", "name", "email"],
    });
  };
}
