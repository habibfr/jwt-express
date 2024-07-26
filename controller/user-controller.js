import UserService from "../service/user-service.js";

export default class UserController {
  static getUsers = async (req, res) => {
    const users = await UserService.getUsers();

    res.json(users);
  };

  static register = async (req, res) => {
    const user = await UserService.createUser(req.body);
    res.json(user);
  };

  static async login(req, res) {
    const result = await UserService.login(req.body, res);

    if (result.errors) {
      return res.status(400).json(result);
    } else if (result.error) {
      return res.status(400).json(result);
    } else {
      return res.status(200).json(result);
    }
  }

  static async logout(req, res) {
    await UserService.logout(req.cookies.refresh_token, res);
  }
}
