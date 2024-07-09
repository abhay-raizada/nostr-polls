// PollResponseForm.tsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  MenuItem,
  Menu,
  CardActions,
} from "@mui/material";
import { Event } from "nostr-tools/lib/types/core";
import { SimplePool } from "nostr-tools";
import { defaultRelays } from "../../nostr";
import { FetchResults } from "./FetchResults";
import { useNavigate } from "react-router-dom";

interface PollResponseFormProps {
  pollEvent: Event;
  showDetailsMenu?: boolean;
  userResponse?: string;
}

const PollResponseForm: React.FC<PollResponseFormProps> = ({
  pollEvent,
  showDetailsMenu,
  userResponse,
}) => {
  const [response, setResponse] = useState<string>(userResponse || "");
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  useEffect(() => {
    setResponse(userResponse || "");
  }, [userResponse]);
  const navigate = useNavigate();

  const handleResponseChange = (response: string) => {
    setResponse(response);
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
        ["response", response],
      ],
      pubkey: await window.nostr.getPublicKey(),
      created_at: Math.floor(Date.now() / 1000),
    };
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
                <RadioGroup
                  aria-label={label}
                  name={pollEvent.id}
                  value={response}
                  defaultValue={userResponse}
                  onChange={(e) => handleResponseChange(e.target.value)}
                >
                  {" "}
                  {options.map((option) => {
                    return (
                      <FormControlLabel
                        key={option[1]}
                        value={option[1]}
                        control={<Radio />}
                        label={option[2]}
                      />
                    );
                  })}
                </RadioGroup>
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
