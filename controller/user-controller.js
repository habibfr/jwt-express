import Users from "../models/user-model.js";
import error_response from "../util/error-response.js";
import bcrypt from "bcrypt";
import success_response from "../util/success-response.js";
import jwt from "jsonwebtoken";
import ZodValidator from "../validation/validator.js";
import userValidation from "../validation/user-validation.js";

export default class UserController {
  static getUsers = async (req, res) => {
    try {
      const users = await Users.findAll({
        attributes: ["id", "name", "email"],
      });
      if (users.length === 0) {
        return res.json(error_response("Data kosong"));
      }
      res.json(users);
    } catch (error) {
      console.log(error);
    }
  };

  static register = async (req, res) => {
    const userLoginRequestValid = ZodValidator.validate(
      userValidation.REGISTER,
      req.body
    );

    if (userLoginRequestValid.errors) {
      return res.status(400).json({ errors: userLoginRequestValid.errors });
    }

    const { name, email, password, confirmPassword } = userLoginRequestValid;

    if (password !== confirmPassword)
      return res
        .status(400)
        .json(error_response("Password and confirm password not match!!"));

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    try {
      await Users.create({
        name: name,
        email: email,
        password: hashPassword,
      });
      res.json(
        success_response("Registration successfully", {
          name: name,
          email: email,
          password: hashPassword,
        })
      );
    } catch (error) {
      if (error.parent.code === "23505") {
        // Kode error untuk duplicate key
        return res
          .status(400)
          .json({ error: `User with email ${email} already exists.` });
      }
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  static login = async (req, res) => {
    try {
      const user = await Users.findAll({
        where: {
          email: req.body.email,
        },
      });
      const match = await bcrypt.compare(req.body.password, user[0].password);
      if (!match)
        return res.status(400).json(error_response("Password not match"));

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

      await Users.update(
        { refresh_token: refresh_token },
        {
          where: {
            id: userId,
          },
        }
      );

      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ access_token });
    } catch (error) {
      res
        .status(404)
        .json(error_response("Password wrong or email not registered"));
      console.log(error);
    }
  };

  static logout = async (req, res) => {
    const refresh_token = req.cookies.refresh_token;
    // console.log(" token", refresh_token);

    if (!refresh_token) return res.sendStatus(204);

    const user = await Users.findAll({
      where: {
        refresh_token: refresh_token,
      },
    });

    if (!user[0]) {
      return res.sendStatus(204);
    }

    const userId = user[0].id;
    console.log(userId);
    await Users.update(
      { refresh_token: null },
      {
        where: {
          id: userId,
        },
      }
    );

    res.clearCookie("refresh_token");
    return res.sendStatus(200);
  };
}
