import { Icon, Menu, MenuItem, Typography } from "@mui/material";
import FilterSvg from "../../Images/Filter.svg";
import React, { useEffect } from "react";
import { SubCloser } from "nostr-tools/lib/types/abstract-pool";
import { useAppContext } from "../../hooks/useAppContext";
import { defaultRelays } from "../../nostr";
import { Event, kinds } from "nostr-tools";

interface FilterProps {
  onChange: (pubkeys: string[]) => void;
}
export const Filters: React.FC<FilterProps> = ({ onChange }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { poolRef, user } = useAppContext();
  const [listEventMap, setListEventMap] = React.useState<Map<
    string,
    Event
  > | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleListEvent = (event: Event) => {
    setListEventMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(event.id, event);
      return newMap;
    });
  };

  const handleListSelected = () => {};

  const handleContactListEvent = (event: Event, closer: SubCloser) => {
    setListEventMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(event.id, event);
      return newMap;
    });
    closer.close();
  };

  const fetchContacts = () => {
    if (!user) return;
    let contactListFilter = {
      kinds: [3],
      limit: 1,
      authors: [user!.pubkey],
    };
    let closer = poolRef.current?.subscribeMany(
      defaultRelays,
      [contactListFilter],
      {
        onevent: (event: Event) => {
          handleContactListEvent(event, closer);
        },
      }
    );
  };

  const fetchLists = () => {
    let followSetFilter = {
      kinds: [30000],
      limit: 100,
      authors: [user!.pubkey],
      "#p": [user!.pubkey],
    };
    fetchContacts();
    let closer = poolRef.current?.subscribeMany(
      defaultRelays,
      [followSetFilter],
      {
        onevent: handleListEvent,
      }
    );
    return closer;
  };

  useEffect(() => {
    let closer: SubCloser | undefined;
    if (!closer && user) {
      closer = fetchLists();
    }
    return () => {
      if (closer) closer.close();
    };
  }, [user]);
  return (
    <div style={{ bottom: 0, cursor: "pointer" }}>
      <Icon
        style={{ position: "relative", bottom: -6, marginRight: 5 }}
        onClick={handleMenuOpen}
      >
        <img src={FilterSvg} alt="filter button" />
      </Icon>
      {listEventMap ? (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {Array.from(listEventMap?.entries() || []).map(
            (value: [string, Event]) => {
              let listName = null;
              console.log("Event is", value);
              if (value[1].kind === 3) listName = "people you follow";
              else
                listName = value[1].tags
                  .filter((tag) => tag[0] === "d")
                  .map((tag) => tag[1])[0];
              return (
                <div>
                  <MenuItem onClick={handleListSelected}>{listName}</MenuItem>
                </div>
              );
            }
          )}
        </Menu>
      ) : (
        <Typography>fetching lists...</Typography>
      )}
    </div>
  );
};
