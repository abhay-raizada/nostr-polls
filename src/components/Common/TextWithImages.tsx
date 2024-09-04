import { isImageUrl } from "../../utils/common";
import React from "react";

interface TextWithImagesProps {
  content: string;
}

const urlRegex = /((http|https):\/\/[^\s]+)/g;
const hashtagRegex = /#(\w+)/g;

export const TextWithImages: React.FC<TextWithImagesProps> = ({ content }) => {
  const processContent = (text: string) => {
    // Split the content by spaces and new lines to process each segment
    const lines = text.split(/\n/);

    return lines.map((line, lineIndex) => {
      const parts = line.split(/(\s+)/);

      return (
        <div key={lineIndex} style={{ overflowWrap: "break-word" }}>
          {parts.map((part, index) => {
            // Check if the part is an image URL
            if (isImageUrl(part)) {
              return (
                <img
                  key={index}
                  src={part}
                  alt={`Content ${lineIndex + 1}-${index}`}
                  style={{
                    maxWidth: "100%",
                    marginBottom: "0.5rem",
                    marginRight: "0.5rem",
                  }}
                />
              );
            }

            // Check if the part is a URL
            if (urlRegex.test(part)) {
              const url = part.match(urlRegex)?.[0];
              return (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#FAD13F",
                  }}
                >
                  {url}
                </a>
              );
            }

            // Check if the part is a hashtag
            if (hashtagRegex.test(part)) {
              const hashtags = part.split(hashtagRegex).filter(Boolean);
              return hashtags.map((hashtag, idx) => (
                <React.Fragment key={`${lineIndex}-${index}-${idx}`}>
                  {idx % 2 === 0 ? (
                    hashtag
                  ) : (
                    <a
                      href={`/search?q=${hashtag}`}
                      style={{ color: "#FAD13F", textDecoration: "underline" }}
                    >
                      {hashtag}
                    </a>
                  )}
                </React.Fragment>
              ));
            }

            return <React.Fragment key={index}>{part}</React.Fragment>;
          })}
          <br /> {/* Preserve line breaks */}
        </div>
      );
    });
  };

  return <>{processContent(content)}</>;
};
