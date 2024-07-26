import UserRepository from "../repository/user-repository.js";
import error_response from "../util/error-response.js";
import bcrypt from "bcrypt";
import success_response from "../util/success-response.js";
import ZodValidator from "../validation/validator.js";
import userValidation from "../validation/user-validation.js";
import jwt from "jsonwebtoken";

export default class UserService {
  static getUsers = async () => {
    try {
      const users = await UserRepository.getUsers();

      if (users.length === 0) {
        return success_response("Data kosong", []);
      }

      return success_response("Success", users);
    } catch (error) {
      return { error: "Internal server error" };
    }
  };

  static createUser = async (dataUser) => {
    const userRegisterRequestValid = ZodValidator.validate(
      userValidation.REGISTER,
      dataUser
    );

    if (userRegisterRequestValid.errors) {
      return { errors: userRegisterRequestValid.errors[0].message };
    }

    const { name, email, password, confirmPassword } = userRegisterRequestValid;

    if (password !== confirmPassword)
      return error_response("Password and confirm password not match!!");

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    try {
      const user = await UserRepository.createUser(name, email, hashPassword);

      if (user)
        return success_response("Registration successfully", {
          name: name,
          email: email,
          password: hashPassword,
        });
    } catch (error) {
      if (error.parent.code === "23505") {
        return { error: `User with email ${email} already exists.` };
      } else {
        return { error: "Internal server error" };
      }
    }
  };

  static async login(dataLogin, res) {
    try {
      const userLoginRequestValid = ZodValidator.validate(
        userValidation.LOGIN,
        dataLogin
      );

      if (userLoginRequestValid.errors) {
        return { errors: userLoginRequestValid.errors[0].message };
      }

      const user = await UserRepository.getUsersByEmail(
        userLoginRequestValid.email
      );

      if (user.length === 0) {
        return error_response("Email not registered");
      }

      const match = await bcrypt.compare(
        userLoginRequestValid.password,
        user[0].password
      );

      if (!match) {
        return error_response("Password not match");
      }

      const userId = user[0].id;
      const name = user[0].name;
      const email = user[0].email;
      const access_token = jwt.sign(
        { userId, name, email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1m",
        }
      );

      const refresh_token = jwt.sign(
        { userId, name, email },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
      );

      await UserRepository.updateRefreshToken(userId, refresh_token);

      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return { access_token };
    } catch (error) {
      console.error(error);
      return error_response("Password wrong or email not registered");
    }
  }

  static async logout(token, res) {
    try {
      if (!token) {
        return res.status(204).send(error_response("Token tidak valid"));
      }

      const user = await UserRepository.getUsersByRefreshToken(token);

      if (!user || user.length === 0) {
        return res
          .status(204)
          .send(error_response("User atau Token tidak ditemukan"));
      }

      const userId = user[0].id;
      await UserRepository.deleteRefreshToken(userId);

      res.clearCookie("refresh_token");
      return res.sendStatus(200);
    } catch (error) {
      console.error(error);
      return res.status(500).send(error_response("Internal server error"));
    }
  }
}
