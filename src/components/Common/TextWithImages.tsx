import { isImageUrl } from "../../utils/common";
import React from "react";

interface TextWithImagesProps {
  content: string;
}
export const TextWithImages: React.FC<TextWithImagesProps> = ({ content }) => {
  const words = content.split(" ");

  return (
    <>
      {words.map((word, index) =>
        isImageUrl(word) ? (
          <img
            key={index}
            src={word}
            alt={`Content ${index + 1}`}
            style={{
              maxWidth: "100%",
              marginBottom: "0.5rem",
              marginRight: "0.5rem",
            }}
          />
        ) : (
          <React.Fragment key={index}>{word} </React.Fragment>
        )
      )}
    </>
  );
};
