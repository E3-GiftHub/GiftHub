// src/__tests__/EditMediaModal.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EditMediaModal from "../components/EditMediaModal";

// Mock Next.js Image with a named functional component
jest.mock("next/image", () => {
  type ImageProps = {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  };

  const MockImage: React.FC<ImageProps> = ({ src, alt, ...rest }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...rest} />;
  };
  MockImage.displayName = "MockImage";

  return {
    __esModule: true,
    default: MockImage,
  };
});

describe("EditMediaModal", () => {
  const mediaItems = [
    { id: 1, url: "https://example.com/img1.jpg", caption: "Caption 1" },
    { id: 2, url: "https://example.com/img2.jpg" },
  ];

  const setup = (media = mediaItems) => {
    const onRemove = jest.fn();
    const onUpload = jest.fn();
    const onClose = jest.fn();

    render(
      <EditMediaModal
        media={media}
        onRemove={onRemove}
        onUpload={onUpload}
        onClose={onClose}
      />
    );
    return { onRemove, onUpload, onClose };
  };

  it("renders back button and calls onClose when clicked", () => {
    const { onClose } = setup();
    const backButton = screen.getByRole("button", { name: /← Back/i });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders Upload Media button and calls onUpload when clicked", () => {
    const { onUpload } = setup();
    const uploadButton = screen.getByRole("button", { name: /Upload Media/i });
    expect(uploadButton).toBeInTheDocument();

    fireEvent.click(uploadButton);
    expect(onUpload).toHaveBeenCalledTimes(1);
  });

  it("shows message when there is no media", () => {
    setup([]);
    expect(screen.getByText(/No media uploaded yet\./i)).toBeInTheDocument();
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });
});
