import SOFTWARE_THEME from "@/config/theme";
import { type ButtonProps, Button as MUIButton, styled } from "@mui/material";

const ColorButton = styled(MUIButton)<ButtonProps>(() => ({
  color: "white",
  backgroundColor: SOFTWARE_THEME.secondary,
  "&:hover": {
    backgroundColor: SOFTWARE_THEME.secondaryHover,
  },
}));

const SecondaryButton = styled(MUIButton)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText(SOFTWARE_THEME.primary),
  backgroundColor: SOFTWARE_THEME.primary,
  "&:hover": {
    backgroundColor: SOFTWARE_THEME.primaryHover,
  },
}));

const BaseButton = (props: ButtonProps) => {
  return <ColorButton variant="contained" {...props} />;
};

const Button = Object.assign(BaseButton, {
  Error: (props: ButtonProps) => (
    <MUIButton color="error" variant="contained" {...props} />
  ),
  Secondary: (props: ButtonProps) => (
    <SecondaryButton variant="contained" {...props} />
  ),
});

export default Button;
