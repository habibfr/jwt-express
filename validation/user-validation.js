import { z } from "zod";

export default class userValidation {
  static REGISTER = z.object({
    name: z.string().min(3).max(100),
    email: z.string().min(3).max(100).email(),
    password: z.string().min(5).max(255),
    confirmPassword: z.string().min(5).max(255),
  });
  static LOGIN = z.object({
    email: z.string().email().min(3).max(50),
    password: z.string().min(5).max(255),
  });
}
