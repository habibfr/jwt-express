import Users from "../models/user-model.js";

export default class UserRepository {
  static getUsers = async () => {
    return await Users.findAll({
      attributes: ["id", "name", "email"],
    });
  };

  static createUser = async (name, email, password) => {
    return await Users.create({
      name: name,
      email: email,
      password: password,
    });
  };

  static getUsersByEmail = async (email) => {
    return await Users.findAll({
      where: {
        email: email,
      },
    });
  };

  static getUsersByRefreshToken = async (refreshToken) => {
    return await Users.findAll({
      where: {
        refresh_token: refreshToken,
      },
    });
  };

  static updateRefreshToken = async (id, refreshToken) => {
    await Users.update(
      { refresh_token: refreshToken },
      {
        where: {
          id: id,
        },
      }
    );
  };

  static deleteRefreshToken = async (id) => {
    await Users.update(
      { refresh_token: null },
      {
        where: {
          id: id,
        },
      }
    );
  };
}
