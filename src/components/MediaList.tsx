import React from "react";
import type { MediaHeader } from "~/models/MediaHeader";

type MediaListProps = {
  loading: boolean;
  media: MediaHeader[];
};

export function MediaList({ loading, media }: Readonly<MediaListProps>) {
  if (loading) return <p>Loading ... </p>;

  return (
    <div>
      {media.map((content) => (
        <div key={content.id}>
          <img src={content.url ?? ""} alt="user visual description" />
        </div>
      ))}
    </div>
  );
}
