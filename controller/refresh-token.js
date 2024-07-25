import Users from "../models/user-model.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    console.log(refresh_token);

    if (!refresh_token) return res.sendStatus(401);

    const user = await Users.findAll({
      where: {
        refresh_token: refresh_token,
      },
    });

    if (!user[0]) return res.sendStatus(403);

    jwt.verify(
      refresh_token,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.sendStatus(403);

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

        res.json({ access_token });
      }
    );
  } catch (error) {
    console.log(error);
  }
};
