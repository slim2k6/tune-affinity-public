export class UserError extends Error {
  constructor(message: string) {
      super(message);
      this.name = "UserError";
  }
}

export class ProcessLockError extends Error {
  constructor(message: string) {
      super(message);
      this.name = "ProcessLockError";
  }
}