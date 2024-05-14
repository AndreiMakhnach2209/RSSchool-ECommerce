import { ReactNode } from "react";
import { ErrorResponse } from "../types/API/Errors";

export default function errorHandler(error: ErrorResponse | Error): ReactNode {
  let errorMessageInner: ReactNode;
  switch (error.message) {
    case "Account with the given credentials not found.":
      errorMessageInner = "Email or password is incorrect";
      break;

    default:
      errorMessageInner =
        "Something went wrong during the registration process. Please, should try again later.";
      break;
  }

  return errorMessageInner;
}