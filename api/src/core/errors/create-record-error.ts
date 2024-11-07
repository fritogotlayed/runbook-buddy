export class CreateRecordError extends Error {
  constructor(entity: string, message: string) {
    super(`Failed to create ${entity}: ${message}`);
    this.name = 'CreateRecordError';
  }
}
