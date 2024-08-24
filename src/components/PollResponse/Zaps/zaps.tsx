import React, { useEffect, useState } from "react";
import { Tooltip, Typography } from "@mui/material";
import { useAppContext } from "../../../hooks/useAppContext";
import { Event } from "nostr-tools/lib/types/core";
import { defaultRelays } from "../../../nostr";
import { FlashOn } from "@mui/icons-material";
import { nip57 } from "nostr-tools";

interface ZapProps {
  pollEvent: Event;
}

const Zap: React.FC<ZapProps> = ({ pollEvent }) => {
  const { user, fetchZapsThrottled, zapsMap, profiles } = useAppContext();

  const [hasZapped, setHasZapped] = useState<boolean>(false);

  useEffect(() => {
    // Fetch existing zaps for the poll event
    const fetchZaps = async () => {
      if (!zapsMap?.get(pollEvent.id)) {
        fetchZapsThrottled(pollEvent.id);
      }
      const fetchedZaps = zapsMap?.get(pollEvent.id) || [];
      const userZapped = fetchedZaps.some((zap) => zap.pubkey === user?.pubkey);
      setHasZapped(userZapped);
    };

    fetchZaps();
  }, [pollEvent.id, zapsMap, fetchZapsThrottled, user]);

  const sendZap = async () => {
    if (!user) {
      alert("Log In to send zaps!");
      return;
    }
    let recipient = profiles?.get(pollEvent.pubkey);
    if (!recipient) {
      alert("Could not fetch recipient profile");
      return;
    }
    const zapAmount = prompt("Enter the amount to zap (in satoshis):");
    if (!zapAmount || isNaN(Number(zapAmount))) {
      alert("Invalid amount.");
      return;
    }

    let zapRequestEvent = nip57.makeZapRequest({
      profile: pollEvent.pubkey,
      event: pollEvent.id,
      amount: Number(zapAmount),
      comment: "",
      relays: defaultRelays,
    });
    let serializedZapEvent = encodeURI(
      JSON.stringify(await window.nostr?.signEvent(zapRequestEvent))
    );
    let zapEndpoint = await nip57.getZapEndpoint(recipient.event);
    const zaprequestUrl =
      zapEndpoint + `?amount=${zapAmount}&nostr=${pollEvent.id}`; //+ "&lnurl=" + lnurl;
    console.log("Zap Endpoint", zapEndpoint, serializedZapEvent, zaprequestUrl);
    const paymentRequest = await fetch(zaprequestUrl)
      .then((result) => {
        return result.json();
      })
      .catch((error) => {
        console.log("error is ", error);
        return null;
      });
    const openAppUrl = "lightning:" + paymentRequest.payment_request;
    window.location.assign(openAppUrl);
    fetchZapsThrottled(pollEvent.id);
  };

  return (
    <div style={{ color: "black", marginLeft: 20 }}>
      <Tooltip onClick={sendZap} style={{ color: "black" }} title="Send a Zap">
        <span
          style={{ cursor: "pointer", display: "flex", flexDirection: "row" }}
        >
          {hasZapped ? (
            <FlashOn
              sx={{
                color: "#FAD13F",
                "& path": {
                  stroke: "black",
                  strokeWidth: 2,
                },
              }}
            />
          ) : (
            <FlashOn
              sx={{
                color: "white",
                "& path": {
                  stroke: "black",
                  strokeWidth: 2,
                },
              }}
            />
          )}
          <Typography>{/*zaps.length*/}</Typography>
        </span>
      </Tooltip>
    </div>
  );
};

export default Zap;
