import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { styled } from "@mui/system";
import logo from "../../Images/logo.png";

const StyledAppBar = styled(AppBar)(() => ({
  backgroundColor: "white",
}));

const HeaderCenterSection = styled("div")({
  flexGrow: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const HeaderRightSection = styled("div")({
  marginLeft: "auto",
});

const LogoAndTitle = styled("div")({
  display: "flex",
  alignItems: "center",
});

const Header: React.FC = () => {
  return (
    <StyledAppBar position="static">
      <Toolbar>
        <HeaderCenterSection>
          <LogoAndTitle>
            <img src={logo} alt="Logo" />
            <Typography variant="h6">Pollerama</Typography>
          </LogoAndTitle>
        </HeaderCenterSection>
        <HeaderRightSection>
          <Button variant="contained">New Poll</Button>
        </HeaderRightSection>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
