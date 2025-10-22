type StandardTheme = {
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  background: string;
  text: string;
  surface: string;
};

// fallback if company not found
const defaultTheme: StandardTheme = {
  primary: "#142D4C",
  primaryHover: "#0A5399", //TODO review this color
  secondary: "#385170",
  secondaryHover: "#029BA0", //TODO review this color
  background: "#ECECEC",
  text: "#000000",
  surface: "#606060",
};

const SOFTWARE_THEME: StandardTheme = {
  ...defaultTheme,
};

export default SOFTWARE_THEME;
