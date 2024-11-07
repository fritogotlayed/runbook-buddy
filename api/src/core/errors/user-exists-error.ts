export class UserExistsError extends Error {
  username: string;
  constructor(username: string) {
    super(`User with username ${username} already exists`);
    this.name = 'UserExistsError';
    this.username = username;
  }
}
