import {createTheme} from "@mui/material/styles";
import {Theme} from "@mui/system/createTheme";
import {CSSObject} from "@mui/material";

export const getColorsWithTheme = (theme: Theme, styles: CSSObject, contrast: CSSObject = {}) => {
  const contrastStyles = Object.keys(styles).reduce<CSSObject>((map, key) => {
    map[key] = contrast[key] || theme.palette.getContrastText(styles[key])
    return map
  }, {})
  return {
    ...theme.applyStyles('light', styles),
    ...theme.applyStyles('dark', contrastStyles)
  }
}

const theme = createTheme({
  colorSchemes: {
    dark: true,
    light: true
  },
  typography: {
    fontFamily: '"Shantell Sans", sans-serif',
  },
  cssVariables: true,
  palette: {
    primary: {
      main: "#FAD13F",
    },
    secondary: {
      main: "#F5F4F1",
    },
    background: {
      default: "#FFFFFF",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => {
        return {
          body: {
            ...getColorsWithTheme(theme, {
              backgroundColor: "#f5f4f1",
            })
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "50px",
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
