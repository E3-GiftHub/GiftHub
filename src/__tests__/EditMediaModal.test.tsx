import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EditMediaModal from "../components/EditMediaModal"; // ajustează calea
import '@testing-library/jest-dom';

// 👇 mock pentru <Image /> din next/image
jest.mock("next/image", () => (props: any) => {
  // simulăm componenta ca <img> simplu
  return <img {...props} />;
});

describe("EditMediaModal", () => {
  const media = ["/image1.jpg", "/image2.png"];
  const onClose = jest.fn();
  const onSave = jest.fn();
  const onUpload = jest.fn();
  const onRemove = jest.fn();

  beforeEach(() => {
    render(
      <EditMediaModal
        media={media}
        onClose={onClose}
        onSave={onSave}
        onUpload={onUpload}
        onRemove={onRemove}
      />
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders all media images", () => {
    media.forEach((src, i) => {
      const image = screen.getByAltText(`Media ${i + 1}`);
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", src);
    });
  });

  test("calls onClose when Back is clicked", () => {
    fireEvent.click(screen.getByText("← Back"));
    expect(onClose).toHaveBeenCalled();
  });

  test("calls onUpload when Upload Media is clicked", () => {
    fireEvent.click(screen.getByText("Upload Media"));
    expect(onUpload).toHaveBeenCalled();
  });

  test("calls onSave when Save Changes is clicked", () => {
    fireEvent.click(screen.getByText("Save Changes"));
    expect(onSave).toHaveBeenCalled();
  });

  test("calls onRemove with correct index", () => {
    const removeButtons = screen.getAllByLabelText("Remove image");
    fireEvent.click(removeButtons[1]); // al doilea buton, imaginea index 1
    expect(onRemove).toHaveBeenCalledWith(1);
  });
});
