// PollResponseForm.tsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  MenuItem,
  Menu,
  CardActions,
  CardHeader,
  Avatar,
} from "@mui/material";
import { Event } from "nostr-tools/lib/types/core";
import { nip19 } from "nostr-tools";
import { defaultRelays, fetchUserProfile, openProfileTab } from "../../nostr";
import { FetchResults } from "./FetchResults";
import { SingleChoiceOptions } from "./SingleChoiceOptions";
import { MultipleChoiceOptions } from "./MultipleChoiceOptions";
import { DEFAULT_IMAGE_URL } from "../../utils/constants";
import { useAppContext } from "../../hooks/useAppContext";
import PollComments from "./Comments/PollComments";
import MoreVertIcon from '@mui/icons-material/MoreVert';


interface PollResponseFormProps {
  pollEvent: Event;
  userResponse?: Event;
}

const PollResponseForm: React.FC<PollResponseFormProps> = ({
  pollEvent,
  userResponse,
}) => {
  const [responses, setResponses] = useState<string[]>(
    userResponse?.tags.filter((t) => t[0] === "response")?.map((t) => t[1]) || []
  );
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { profiles, addEventToProfiles, poolRef } = useAppContext();
  const pollType = pollEvent.tags.find((t) => t[0] === "polltype")?.[1] || "singlechoice";

  useEffect(() => {
    if (!profiles?.has(pollEvent.pubkey)) {
      fetchUserProfile(pollEvent.pubkey, poolRef.current).then((event: Event | null) => {
        if (event) addEventToProfiles(event);
      });
    }
  }, [pollEvent, profiles, addEventToProfiles, poolRef]);

  const handleResponseChange = (optionValue: string) => {
    if (pollType === "singlechoice") {
      setResponses([optionValue]);
    } else if (pollType === "multiplechoice") {
      setResponses((prevResponses) =>
        prevResponses.includes(optionValue)
          ? prevResponses.filter((val) => val !== optionValue)
          : [...prevResponses, optionValue]
      );
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!window.nostr) {
      alert("Nostr Signer Extension Is Required.");
      return;
    }

    const responseEvent = {
      kind: 1018,
      content: "",
      tags: [
        ["e", pollEvent.id],
        ...responses.map((response) => ["response", response]),
      ],
      pubkey: await window.nostr.getPublicKey(),
      created_at: Math.floor(Date.now() / 1000),
    };
    const signedResponse = await window.nostr.signEvent(responseEvent);
    let relays = pollEvent.tags.filter((t) => t[0] === "relay")
      .map((t) => t[1])
    relays = relays || defaultRelays
    poolRef.current.publish(relays, signedResponse);
  };

  const toggleResults = () => {
    setShowResults(!showResults);
  };

  const label = pollEvent.tags.find((t) => t[0] === "label")?.[1] || pollEvent.content;
  const options = pollEvent.tags.filter((t) => t[0] === "option");

  return (
    <div>
      <Card
        variant="elevation"
        className="poll-response-form"
        style={{ margin: 10 }}
      >
        <form onSubmit={handleSubmitResponse}>
          <Card variant="outlined">
            <CardHeader
              title={label}
              avatar={
                <Avatar
                  src={profiles?.get(pollEvent.pubkey)?.picture || DEFAULT_IMAGE_URL}
                  onClick={() => {
                    openProfileTab(nip19.npubEncode(pollEvent.pubkey));
                  }}
                />
              }
              action={
                <div>
                  <Button
                    onClick={(e) => {
                      setIsDetailsOpen(!isDetailsOpen);
                      setAnchorEl(e.currentTarget);
                    }}
                    style={{ color: "black" }}
                    variant="text"
                  >
                    <MoreVertIcon />
                  </Button>
                  <Menu
                    open={isDetailsOpen}
                    anchorEl={anchorEl}
                    onClose={() => {
                      setAnchorEl(null);
                      setIsDetailsOpen(false);
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        window.open(`${window.location.origin}/respond/${pollEvent.id}`)
                      }}

                    >
                      Open URL
                    </MenuItem>
                  </Menu>
                </div>
              }
            >
              <FormLabel
                component="legend"
                sx={{ fontWeight: "bold", margin: "20px" }}
              >
                {label}
              </FormLabel>
            </CardHeader>
            <CardContent>
              <FormControl component="fieldset">
                {!showResults ? (
                  pollType === "singlechoice" ? (
                    <SingleChoiceOptions
                      options={options as [string, string, string][]}
                      handleResponseChange={handleResponseChange}
                      response={responses}
                    />
                  ) : pollType === "multiplechoice" ? (
                    <MultipleChoiceOptions
                      options={options as [string, string, string][]}
                      handleResponseChange={handleResponseChange}
                      response={responses}
                    />
                  ) : null
                ) : (
                  <FetchResults pollEvent={pollEvent} />
                )}
              </FormControl>
              <CardActions>
                <Button
                  onClick={toggleResults}
                  color="secondary"
                  variant="contained"
                >
                  {showResults ? "Hide Results" : "Show Results"}
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Submit Response
                </Button>
              </CardActions>
            </CardContent>
          </Card>
        </form>
        <CardContent><PollComments pollEventId={pollEvent.id} /></CardContent>
      </Card>
    </div>
  );
};

export default PollResponseForm;
