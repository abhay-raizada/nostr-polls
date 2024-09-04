import { Icon, Menu, MenuItem } from "@mui/material";
import FilterSvg from "../../Images/Filter.svg";
import React from "react";
import { Event } from "nostr-tools";
import { useListContext } from "../../hooks/useListContext";

interface FilterProps {
  onChange: (pubkeys: string[]) => void;
}
export const Filters: React.FC<FilterProps> = ({ onChange }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { lists, handleListSelected, selectedList } = useListContext();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAllPosts = () => {
    handleListSelected(null);
    onChange([]);
  };

  const handleFilterChange = (value: string) => {
    handleListSelected(value);
    const selectedList = lists?.get(value);
    const pubkeys =
      selectedList?.tags.filter((t) => t[0] === "p").map((t) => t[1]) || [];
    onChange(pubkeys);
  };
  return (
    <div style={{ bottom: 0, cursor: lists ? "pointer" : "not-allowed" }}>
      <Icon
        style={{
          position: "relative",
          bottom: -6,
          marginRight: 5,
          color: lists ? "black" : "grey", // Apply the determined color here
          opacity: lists ? 1 : 0.5, // Adjust opacity if needed
        }}
        onClick={handleMenuOpen}
      >
        <img src={FilterSvg} alt="filter button" />
      </Icon>
      {lists ? (
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
            All Votes
          </MenuItem>
          {Array.from(lists?.entries() || []).map((value: [string, Event]) => {
            let listName = null;
            if (value[1].kind === 3) listName = "people you follow";
            else
              listName =
                value[1].tags
                  .filter((tag) => tag[0] === "d")
                  .map((tag) => tag[1])[0] || `kind:${value[1].kind}`;
            return (
              // <div>
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
              // </div>
            );
          })}
        </Menu>
      ) : null}
    </div>
  );
};
