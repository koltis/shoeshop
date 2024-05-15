import { sign, verify } from "jsonwebtoken";

export function singToken(object: Record<string, unknown>) {
  return sign({ ...object }, process.env.JWT_SECRET as string, {
    expiresIn: 60 * 10,
  });
}

export function validateSignedToken(token: string) {
  try {
    return verify(token, process.env.JWT_SECRET as string);
  } catch (e) {
    return null;
  }
}
