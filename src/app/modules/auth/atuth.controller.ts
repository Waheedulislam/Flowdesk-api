import catchAsync from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { AuthService } from "./auth.service";
import httpStatus from "http-status-codes";

const registerUser = catchAsync(async (req, res) => {
  //1. Get register data from the client
  const payload = req.body;

  //2. Send the business logic to services
  const result = await AuthService.registerUser(payload);

  //3. Providing successful response to client
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});
export const AuthController = {
  registerUser,
};
