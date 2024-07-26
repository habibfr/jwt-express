import UserRepository from "../repository/user-repository.js";

export default class UserService {
  static getUsers = async () => {
    try {
      const users = await UserRepository.getUsers();

      return users;
    } catch (error) {
      console.log(error);
    }
  };
}
