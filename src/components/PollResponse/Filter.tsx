import {Divider, Icon, Menu, MenuItem, useTheme} from "@mui/material";
import {FilterIcon} from "../../Images/FilterIcon";
import React from "react";
import { Event } from "nostr-tools";
import { useListContext } from "../../hooks/useListContext";
import { useUserContext } from "../../hooks/useUserContext";

interface FilterProps {
  onChange: (pubkeys: string[]) => void;
}
export const Filters: React.FC<FilterProps> = ({ onChange }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { lists, handleListSelected, selectedList } = useListContext();
  const { user } = useUserContext();
  const theme = useTheme()

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAllPosts = () => {
    handleListSelected(null);
    onChange([]);
    handleMenuClose();
  };

  const handleFilterChange = (value: string) => {
    handleListSelected(value);
    const selectedList = lists?.get(value);
    const pubkeys =
      selectedList?.tags.filter((t) => t[0] === "p").map((t) => t[1]) || [];
    onChange(pubkeys);
    handleMenuClose();
  };

    return (
    <div style={{ bottom: 0, cursor: "pointer" }}>
      <Icon
        style={{
          position: "relative",
          bottom: -6,
          marginRight: 5,
          color: "black",
          opacity: 1,
        }}
        onClick={handleMenuOpen}
      >
        <FilterIcon fill={theme.palette.mode === "dark" ? "#fff" : "#000"} />
      </Icon>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          selected={!selectedList}
          onClick={(e) => {
            handleAllPosts();
          }}
          key="All Votes"
          sx={{
            "&.Mui-selected": {
              opacity: 1,
              backgroundColor: "#FAD13F",
            },
          }}
        >
          all votes
        </MenuItem>
        {lists ? (
          <div>
            <Divider />
            {lists.has(`3:${user?.pubkey}`) ? (
              <div>
                <MenuItem
                  selected={selectedList === `3:${user?.pubkey}`}
                  onClick={(e) => {
                    handleFilterChange(`3:${user?.pubkey}`);
                  }}
                  key="Contact List"
                  sx={{
                    "&.Mui-selected": {
                      opacity: 1,
                      backgroundColor: "#FAD13F",
                    },
                  }}
                >
                  people you follow
                </MenuItem>
                <Divider />
              </div>
            ) : null}
            {Array.from(lists?.entries() || []).map(
              (value: [string, Event]) => {
                if (value[1].kind === 3) return null;
                const listName =
                  value[1].tags
                    .filter((tag) => tag[0] === "d")
                    .map((tag) => tag[1])[0] || `kind:${value[1].kind}`;
                return (
                  <MenuItem
                    selected={value[0] === selectedList}
                    onClick={(e) => {
                      handleFilterChange(value[0]);
                    }}
                    sx={{
                      "&.Mui-selected": {
                        opacity: 1, // Override the default opacity
                        backgroundColor: "#FAD13F", // Optional: Adjust background color for visibility
                      },
                    }}
                    key={value[0]}
                  >
                    {listName}
                  </MenuItem>
                );
              }
            )}
            <Divider />
          </div>
        ) : null}
        <MenuItem
          onClick={(e) => {
            window.open("https://listr.lol", "_blank");
          }}
          key="Create List"
          sx={{
            "&.Mui-selected": {
              opacity: 1,
              backgroundColor: "#FAD13F",
            },
          }}
        >
          + create a new list
        </MenuItem>
      </Menu>
    </div>
  );
};
