export class EventManagementException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventManagementException";
  }
}
