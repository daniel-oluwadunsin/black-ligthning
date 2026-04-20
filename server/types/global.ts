export class CustomError extends Error {
  statusCode: number;

  constructor(
    message: string,
    statusCode: number = 500,
    name: string = "HttpError",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.name = name;

    Error.captureStackTrace(this, this.constructor);
  }
}

export enum HttpStatusCode {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
  Ok = 200,
  Created = 201,
  Accepted = 202,
  Conflict = 409,
  Redirect = 302,
}
