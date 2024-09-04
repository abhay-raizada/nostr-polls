import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  TextField,
  Typography,
} from "@mui/material";
import { useAppContext } from "../../../hooks/useAppContext";
import { defaultRelays } from "../../../nostr";
import { nip19 } from "nostr-tools";
import { DEFAULT_IMAGE_URL } from "../../../utils/constants";
import CommentIcon from "@mui/icons-material/Comment";
import { SubCloser } from "nostr-tools/lib/types/abstract-pool";

interface PollCommentsProps {
  pollEventId: string;
}

const PollComments: React.FC<PollCommentsProps> = ({ pollEventId }) => {
  const [newComment, setNewComment] = useState<string>("");
  const [showComments, setShowComments] = useState<boolean>(false);
  const {
    poolRef,
    profiles,
    fetchUserProfileThrottled,
    fetchCommentsThrottled,
    commentsMap,
    addEventToMap,
  } = useAppContext();

  const fetchComments = () => {
    let filter = {
      kinds: [1],
      "#e": [pollEventId],
    };
    let closer = poolRef.current.subscribeMany(defaultRelays, [filter], {
      onevent: addEventToMap,
    });
    return closer;
  };

  useEffect(() => {
    let closer: SubCloser | undefined;
    if (!closer && showComments) {
      closer = fetchComments();
      return () => {
        if (closer) closer.close();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments]);

  useEffect(() => {
    if (!commentsMap?.get(pollEventId)) {
      fetchCommentsThrottled(pollEventId);
    }
  }, []);

  const handleSubmitComment = async () => {
    if (!window.nostr) {
      alert("Nostr Signer Extension Is Required.");
      return;
    }
    if (!newComment.trim()) return;

    const commentEvent = {
      kind: 1,
      content: newComment,
      tags: [["e", pollEventId]],
      pubkey: await window.nostr.getPublicKey(),
      created_at: Math.floor(Date.now() / 1000),
    };
    const signedComment = await window.nostr.signEvent(commentEvent);
    poolRef.current.publish(defaultRelays, signedComment);
    setNewComment("");
  };

  let commentSet = new Set();
  return (
    <div>
      <Tooltip title={showComments ? "Hide Comments" : "View Comments"}>
        <span
          onClick={() => setShowComments(!showComments)}
          style={{ cursor: "pointer", display: "flex", flexDirection: "row" }}
        >
          <CommentIcon style={{ color: "black" }} />
          <Typography>
            {commentsMap?.get(pollEventId)?.length
              ? commentsMap?.get(pollEventId)?.length
              : null}
          </Typography>
        </span>
      </Tooltip>
      {showComments && (
        <div>
          <TextField
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            label="Add a comment"
            fullWidth
            multiline
            style={{ margin: 5 }}
          />
          <Button
            onClick={handleSubmitComment}
            variant="contained"
            style={{ margin: 5 }}
            color="secondary"
          >
            Submit Comment
          </Button>
          <div>
            {commentsMap?.get(pollEventId) ? (
              <h5> No Comments</h5>
            ) : (
              <h5>Comments</h5>
            )}

            {(commentsMap?.get(pollEventId) || []).map((comment) => {
              if (commentSet.has(comment.id)) return;
              commentSet.add(comment.id);
              let commentUser = profiles?.get(comment.pubkey);
              if (!commentUser) fetchUserProfileThrottled(comment.pubkey);
              return (
                <Card
                  key={comment.id}
                  variant="outlined"
                  style={{ marginTop: 10 }}
                >
                  <CardHeader
                    avatar={
                      <Avatar src={commentUser?.picture || DEFAULT_IMAGE_URL} />
                    }
                    title={
                      profiles?.get(comment.pubkey)?.name ||
                      nip19.npubEncode(comment.pubkey).substring(0, 10) + "..."
                    }
                  />
                  <CardContent>{comment.content}</CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PollComments;
