// CommentsSection.tsx
import React, { useEffect, useState } from "react";
import { Avatar, Button, Card, CardContent, CardHeader, Link, TextField, Typography } from "@mui/material";
import { Event } from "nostr-tools/lib/types/core";
import { useAppContext } from "../../../hooks/useAppContext";
import { defaultRelays, fetchUserProfile } from "../../../nostr";
import { nip19 } from "nostr-tools";
import { DEFAULT_IMAGE_URL } from "../../../utils/constants";

interface PollCommentsProps {
    pollEventId: string;
}

const PollComments: React.FC<PollCommentsProps> = ({ pollEventId }) => {
    const [comments, setComments] = useState<Event[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [showComments, setShowComments] = useState<boolean>(false);
    const { poolRef, profiles, addEventToProfiles } = useAppContext();

    const handleCommentEvent = (event: Event) => {
        setComments((prevComments) => [...prevComments, event]);
    };

    const fetchEventUser = async (event: Event) => {
        const userEvent = await fetchUserProfile(event.pubkey, poolRef.current)
        if (userEvent) addEventToProfiles(userEvent)
    }

    const fetchComments = () => {
        let filter = {
            kinds: [1],
            "#e": [pollEventId],
        };
        let closer = poolRef.current.subscribeMany(defaultRelays, [filter], {
            onevent: handleCommentEvent,
        });
        return closer;
    };

    useEffect(() => {
        if (comments.length === 0) {
            const closer = fetchComments();
            return () => {
                closer.close();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profiles, comments]);

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

    return (
        <div>
            <Link underline="always" onClick={() => setShowComments(!showComments)} style={{ margin: 0, top: 0 }} >
                <Typography style={{ color: "black", fontSize: 12 }}>{showComments ? "Hide Comments" : "View Comments"}</Typography>
            </Link>
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
                    <Button onClick={handleSubmitComment} variant="contained" style={{ margin: 5 }} color="secondary">
                        Submit Comment
                    </Button>
                    <div>
                        {comments.length === 0 ? <h5>No Comments</h5> : <h5>Comments</h5>}
                        {comments.map((comment) => {
                            let commentUser = profiles?.get(comment.pubkey)
                            if (!commentUser) fetchEventUser(comment)
                            return (
                                <Card key={comment.id} variant="outlined" style={{ marginTop: 10 }}>
                                    <CardHeader
                                        avatar={<Avatar src={commentUser?.picture || DEFAULT_IMAGE_URL} />}
                                        title={
                                            profiles?.get(comment.pubkey)?.name || nip19.npubEncode(comment.pubkey).substring(0, 10) + "..."
                                        } />
                                    <CardContent>{comment.content}</CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PollComments;
