import { EventManagementException } from "~/services/EventManagementException";

describe("EventManagementException", () => {
  it("should create an instance with the correct message and name", () => {
    const message = "Test error message";
    const exception = new EventManagementException(message);

    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(message);
    expect(exception.name).toBe("EventManagementException");
  });
});
