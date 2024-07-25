import jwt from "jsonwebtoken";
import error_response from "../util/error-response.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403).json(error_response("Token not valid"));
    req.email = decoded.email;
    next();
  });
};
