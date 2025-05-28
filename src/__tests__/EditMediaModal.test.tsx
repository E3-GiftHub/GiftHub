import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EditMediaModal from "../components/EditMediaModal"; 
import '@testing-library/jest-dom';
import type { ImgHTMLAttributes } from "react";

jest.mock("next/image", () => {
  const MockedImage = (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />;
  MockedImage.displayName = "MockedImage";
  return MockedImage;
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

});
