// UserMenu.tsx
import React from "react";
import { Avatar, Menu, MenuItem } from "@mui/material";
import {
  removePubKeyFromLocalStorage,
  setPubKeyInLocalStorage,
} from "../../utils/localStorage";
import { fetchUserProfile } from "../../nostr";
import { Event } from "nostr-tools/lib/types/core";
import { useAppContext } from "../../hooks/useAppContext";

const UserMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { user, setUser } = useAppContext();

  const handleLogin = async () => {
    if (window?.nostr) {
      try {
        // Get public key from NIP-07 signer extension
        const pubkey = await window.nostr.getPublicKey();
        console.log("Pubkey is", pubkey);
        // Save public key to local storage
        setPubKeyInLocalStorage(pubkey);
        fetchUserProfile(pubkey).then((kind0: Event | null) => {
          if (!kind0) {
            setUser({
              name: "Anon..",
              picture:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Anonymous.svg/200px-Anonymous.svg.png",
              pubkey,
            });
            return;
          }
          let profile = JSON.parse(kind0.content);
          setUser({ name: profile.name, picture: profile.picture, pubkey });
        });
        setAnchorEl(null);
      } catch (error) {
        console.error("Error while logging in:", error);
      }
    } else {
      alert(
        "No NIP-07 compatible signer extension found. Please install one and try again."
      );
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogOut = () => {
    removePubKeyFromLocalStorage(); // Remove pubkey from local storage on logout
    setUser(null); // Clear user state
    setAnchorEl(null);
  };

  return (
    <>
      {user ? (
        <Avatar src={user.picture} onClick={handleMenuOpen}>
          {!user.picture && user.name?.[0]}
        </Avatar>
      ) : (
        <Avatar onClick={handleMenuOpen}></Avatar>
      )}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {user ? (
          <div>
            <MenuItem onClick={handleMenuClose}>Your Polls</MenuItem>
            <MenuItem onClick={handleLogOut}>Log Out</MenuItem>
          </div>
        ) : (
          <MenuItem onClick={handleLogin}>Log In Via Extension</MenuItem>
        )}
      </Menu>
    </>
  );
};

export default UserMenu;
