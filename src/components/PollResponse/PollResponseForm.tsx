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
} from "@mui/material";
import { Event } from "nostr-tools/lib/types/core";
import { SimplePool } from "nostr-tools";
import { defaultRelays } from "../../nostr";
import { FetchResults } from "./FetchResults";
import { useNavigate } from "react-router-dom";
import { SingleChoiceOptions } from "./SingleChoiceOptions";
import { MultipleChoiceOptions } from "./MultipleChoiceOptions";

interface PollResponseFormProps {
  pollEvent: Event;
  showDetailsMenu?: boolean;
  userResponse?: Event;
}

const PollResponseForm: React.FC<PollResponseFormProps> = ({
  pollEvent,
  showDetailsMenu,
  userResponse,
}) => {
  const [responses, setResponses] = useState<string[]>(
    userResponse?.tags.filter((t) => t[0] === "response")?.map((t) => t[1]) || []
  );
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const pollType = pollEvent.tags.find((t) => t[0] === "polltype")?.[1] || "singlechoice"
  useEffect(() => {
    setResponses(userResponse?.tags.filter((t) => t[0] === "response")?.map((t) => t[1]) || []);
  }, [userResponse]);
  const navigate = useNavigate();

  const handleResponseChange = (optionValue: string) => {
    let PollType = pollEvent.tags.find((t) => t[0] === "polltype" )?.[1]
    if (PollType === "singlechoice") {
      setResponses([optionValue]);
    } 
    else if (PollType === "multiplechoice") {
      setResponses([optionValue]);
      // Multiple Choice: Toggle the selection of the given option value
      if (responses.includes(optionValue)) {
        // If the option is already in response array, remove it
        setResponses(responses.filter((val) => val !== optionValue));
      } else {
        // If the option is not in response array, add it
        setResponses([...responses, optionValue]);
      }
    } 
    else {
      setResponses([optionValue]);
    } 
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!window.nostr) {
      alert("Nostr Signer Extension Is Required.");
      return;
    }
    e.preventDefault();
    const responseEvent = {
      kind: 1018,
      content: "",
      tags: [
        ["e", pollEvent.id],
      ],
      pubkey: await window.nostr.getPublicKey(),
      created_at: Math.floor(Date.now() / 1000),
    };
    responses.map((response) => responseEvent.tags.push(["response", response]))
    const signedResponse = await window.nostr.signEvent(responseEvent);
    const pool = new SimplePool();
    console.log("Final Response before sending.", signedResponse);
    const messages = await Promise.allSettled(
      pool.publish(defaultRelays, signedResponse)
    );
    console.log("reply from relays", messages);
  };

  const toggleResults = () => {
    setShowResults(!showResults);
  };

  let label = pollEvent.tags.find((t) => t[0] === "label")?.[1];
  let options = pollEvent.tags.filter((t) => t[0] === "option");

  return (
    <Card
      variant="elevation"
      className="poll-response-form"
      style={{ margin: 10 }}
    >
      <form onSubmit={handleSubmit}>
        <Card variant="outlined">
          <FormLabel
            component="legend"
            sx={{ fontWeight: "bold", margin: "20px" }}
          >
            {label}
          </FormLabel>
          <CardContent>
            <FormControl component="fieldset">
              {!showResults ? (
                pollType === "singlechoice" ? <SingleChoiceOptions options={options as [string, string, string][]} handleResponseChange={handleResponseChange} response={responses} /> :  (pollType === "multiplechoice" ? <MultipleChoiceOptions options={options as [string, string, string][]} handleResponseChange={handleResponseChange} response={responses} /> : null)
              
              ) : (
                //   <div key={option[1]}>
                //     <Typography>{option[2]}</Typography>
                //     <LinearProgress
                  //       variant="determinate"
                  //       value={
                  //         (Number(
                  //           results.find((r) => r[2] === option[1])?.[1] || 0
                  //         ) /
                  //           totalVotes) *
                  //         100
                  //       }
                  //     />
                  //   </div>
                  <FetchResults pollEvent={pollEvent} />
              )}
            </FormControl>
            <CardActions>
              <Button
                onClick={toggleResults}
                color="secondary"
                variant="contained"
              >
                {showResults ? <>Hide Results</> : <>Show Results</>}
              </Button>
              <div>
                {showDetailsMenu ? (
                  <Button
                    onClick={(e) => {
                      setIsDetailsOpen(!isDetailsOpen);
                      setAnchorEl(e.currentTarget);
                    }}
                    color="secondary"
                    variant="contained"
                  >
                    deets
                  </Button>
                ) : null}
                <Menu
                  open={isDetailsOpen}
                  anchorEl={anchorEl}
                  onClose={() => {
                    setAnchorEl(null);
                    setIsDetailsOpen(false);
                  }}
                >
                  <MenuItem
                    onClick={() => navigate(`/respond/${pollEvent.id}`)}
                  >
                    Open Url
                  </MenuItem>
                </Menu>
              </div>
              <Button type="submit" variant="contained" color="secondary">
                Submit Response
              </Button>
            </CardActions>
          </CardContent>
        </Card>
      </form>
    </Card>
  );
};

export default PollResponseForm;
