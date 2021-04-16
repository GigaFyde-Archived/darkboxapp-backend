export class HttpError extends Error {
  public statusCode: number;
  constructor(code: number, message: string) {
    super(message);
    this.statusCode = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class InvalidBody extends HttpError {
  constructor(
    code = 400,
    message = 'The language and content fields must be set'
  ) {
    super(code, message);
  }
}

class InvalidAuthBody extends HttpError {
  constructor(code = 400, message = 'The password field needs to be set') {
    super(code, message);
  }
}

class InvalidId extends HttpError {
  constructor(code = 400, message = 'The id query field needs to be set') {
    super(code, message);
  }
}

class UnknownPost extends HttpError {
  constructor(
    code = 404,
    message = 'The specified id does not reference an existing post'
  ) {
    super(code, message);
  }
}

class InvalidUser extends HttpError {
  constructor(code = 403, message = 'The specified user is invalid') {
    super(code, message);
  }
}

class InvalidBits extends HttpError {
  constructor(code = 403, message = 'The specified password is invalid') {
    super(code, message);
  }
}

export const HttpErrors = {
  InvalidBody: new InvalidBody(),
  InvalidAuthBody: new InvalidAuthBody(),
  UnknownPost: new UnknownPost(),
  InvalidUser: new InvalidUser(),
  InvalidBits: new InvalidBits(),
  InvalidId: new InvalidId(),
};
