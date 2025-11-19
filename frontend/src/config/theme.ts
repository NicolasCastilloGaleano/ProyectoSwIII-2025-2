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
const SOFTWARE_THEME: StandardTheme = {
  // primary: "#142D4C",
  primary: "#4f39f6",
  primaryHover: "#6257B5",
  secondary: "#385170",
  secondaryHover: "#496A92",
  background: "#ECECEC",
  text: "#000000",
  surface: "#606060",
};

export default SOFTWARE_THEME;
