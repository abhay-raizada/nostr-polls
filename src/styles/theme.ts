import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: '"Shantell Sans", sans-serif',
  },
  palette: {
    primary: {
      main: "#FAD13F",
    },
    secondary: {
      main: "#F5F4F1",
    },
    background: {
      default: "#FFFFFF",
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "50px", // adjust the value as needed for your desired roundness
          textTransform: "none",
        },
      },
    },
    // MuiPaper: {
    //   styleOverrides: {
    //     root: {
    //       backgroundColor: "#FFFFFF",
    //     },
    //   },
    // },
  },
});

export default theme;
