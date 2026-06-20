export class DomainError extends Error {
  constructor(
    message: string,
    public readonly status: number = 409
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
