import React, { useEffect } from "react";
import { Tooltip, Typography } from "@mui/material";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import { useAppContext } from "../../../hooks/useAppContext";
import { Event, UnsignedEvent } from "nostr-tools/lib/types/core";
import { defaultRelays } from "../../../nostr";
import { Favorite } from "@mui/icons-material";

interface LikesProps {
  pollEvent: Event;
}

const Likes: React.FC<LikesProps> = ({ pollEvent }) => {
  const { likesMap, fetchLikesThrottled, user, poolRef, addEventToMap } =
    useAppContext();

  const addLike = async () => {
    if (!user) {
      alert("Login To Like!");
      return;
    }
    let event: UnsignedEvent = {
      pubkey: user?.pubkey!,
      content: "+",
      kind: 7,
      tags: [["e", pollEvent.id, defaultRelays[0]]],
      created_at: Math.floor(Date.now() / 1000),
    };
    let finalEvent = await window.nostr!.signEvent(event);
    poolRef.current.publish(defaultRelays, finalEvent);
    addEventToMap(finalEvent);
  };

  const hasLiked = () => {
    if (!user) return false;
    return !!likesMap
      ?.get(pollEvent.id)
      ?.map((e) => e.pubkey)
      ?.includes(user.pubkey);
  };

  useEffect(() => {
    const fetchAndSetLikes = async () => {
      if (!likesMap?.get(pollEvent.id)) fetchLikesThrottled(pollEvent.id);
    };

    fetchAndSetLikes();
  }, [pollEvent.id, likesMap, fetchLikesThrottled, user]);

  const handleLike = async () => {
    if (!window.nostr) {
      alert("Nostr Signer Extension Is Required.");
      return;
    }
    if (hasLiked()) {
      //await removeLike(pollEvent.id, userPublicKey);
      //setLikes((prevLikes) => prevLikes.filter((like) => like !== userPublicKey));
    } else {
      await addLike();
    }
  };

  return (
    <div style={{ color: "black", marginLeft: 20 }}>
      <Tooltip
        onClick={handleLike}
        style={{ color: "black" }}
        title={hasLiked() ? "Unlike" : "Like"}
      >
        <span
          style={{ cursor: "pointer", display: "flex", flexDirection: "row" }}
          onClick={handleLike}
        >
          {hasLiked() ? (
            <Favorite
              sx={{
                color: "#FAD13F",
                "& path": {
                  stroke: "black",
                  strokeWidth: 3,
                },
              }}
              style={{ display: "block" }}
            />
          ) : (
            <FavoriteBorder />
          )}
          <Typography>
            {likesMap?.get(pollEvent.id)?.length
              ? new Set(likesMap?.get(pollEvent.id)?.map((like) => like.pubkey))
                  .size
              : null}
          </Typography>
        </span>
      </Tooltip>
    </div>
  );
};

export default Likes;
