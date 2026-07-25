import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

// option-1
const generateToken = (
  payload: string | object | Buffer,
  secret: Secret,
  expiresIn: SignOptions["expiresIn"],
) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn,
  });

  return token;
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

// option-2

// const generateToken = (
//   payload: string | object | Buffer,
//   secret: string,
//   expiresIn: SignOptions["expiresIn"]
// ): string => {
//   const token: SignOptions = {
//     algorithm: "HS256",
//     expiresIn,
//   };

//   return jwt.sign(payload, secret, token);
// };

export const jwtHelpers = {
  generateToken,
  verifyToken,
};
