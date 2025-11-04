import { SOFTWARE_THEME } from "@/config";
import Search from "@mui/icons-material/Search";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  IconButton,
  InputAdornment,
  styled,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import { type ReactNode, useState } from "react";
import { InputAutocomplete, InputAutocompleteTag } from "./AutocompleteInputs";

type InputIconProps = TextFieldProps & {
  iconStart?: ReactNode;
};

type InputPhoneProps = TextFieldProps & {
  iconStart?: ReactNode;
  maxLength?: number;
};

type InputSelectProps = TextFieldProps & {
  children: React.ReactNode;
  label: string;
};

type InputSelectPropsWithIcon = InputSelectProps & InputIconProps;

export const StyledTextField = styled(TextField)(() => ({
  "& label.Mui-focused": {
    color: SOFTWARE_THEME.primary,
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: SOFTWARE_THEME.primary,
  },
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: SOFTWARE_THEME.primary,
    },
  },
}));

const BaseInput = ({ size, ...props }: TextFieldProps) => {
  return <StyledTextField size={size || "small"} {...props} />;
};

const Input = Object.assign(BaseInput, {
  TextArea: ({ rows, ...props }: TextFieldProps) => (
    <StyledTextField multiline rows={rows || 4} {...props} />
  ),
  Checkbox: (props: TextFieldProps) => (
    <StyledTextField size={props.size || "small"} type="checkbox" {...props} />
  ),
  Date: ({ size, ...props }: TextFieldProps) => (
    <StyledTextField
      size={size || "small"}
      slotProps={{ inputLabel: { shrink: true } }}
      type="date"
      {...props}
    />
  ),
  Search: ({ size, ...props }: TextFieldProps) => (
    <StyledTextField
      size={size || "small"}
      slotProps={{
        ...props.slotProps,
        input: {
          ...(props.slotProps?.input ?? {}),
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  ),
  Icon: ({ iconStart, size, ...props }: InputIconProps) => (
    <StyledTextField
      size={size || "small"}
      {...props}
      slotProps={{
        ...props.slotProps,
        input: {
          ...(props.slotProps?.input ?? {}),
          startAdornment: iconStart && (
            <InputAdornment position="start">{iconStart}</InputAdornment>
          ),
        },
      }}
    />
  ),
  Number: ({ iconStart, size, ...props }: InputIconProps) => (
    <StyledTextField
      size={size || "small"}
      slotProps={{
        ...props.slotProps,
        input: {
          ...(props.slotProps?.input ?? {}),
          startAdornment: iconStart && (
            <InputAdornment position="start">{iconStart}</InputAdornment>
          ),
        },
        inputLabel: { shrink: true },
      }}
      type="number"
      inputProps={{ min: 0 }}
      {...props}
    />
  ),
  Select: ({ children, size, ...props }: InputSelectProps) => (
    <StyledTextField select size={size || "small"} {...props}>
      {children}
    </StyledTextField>
  ),
  SelectIcon: ({
    children,
    iconStart,
    size,
    ...props
  }: InputSelectPropsWithIcon) => (
    <StyledTextField
      select
      size={size || "small"}
      {...props}
      slotProps={{
        ...props.slotProps,
        input: {
          ...(props.slotProps?.input ?? {}),
          startAdornment: iconStart && (
            <InputAdornment position="start">{iconStart}</InputAdornment>
          ),
        },
      }}
    >
      {children}
    </StyledTextField>
  ),
  DateTime: ({ size, ...props }: TextFieldProps) => (
    <StyledTextField
      size={size || "small"}
      slotProps={{ inputLabel: { shrink: true } }}
      type="datetime-local"
      {...props}
    />
  ),
  Password: ({ size, iconStart, ...props }: InputIconProps) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
      setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      event.preventDefault();
    };

    return (
      <StyledTextField
        size={size || "small"}
        {...props}
        type={showPassword ? "text" : "password"}
        slotProps={{
          ...props.slotProps,
          input: {
            ...(props.slotProps?.input ?? {}),
            startAdornment: iconStart && (
              <InputAdornment position="start">{iconStart}</InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    );
  },
  Phone: ({ iconStart, maxLength, size, ...props }: InputPhoneProps) => (
    <StyledTextField
      size={size || "small"}
      type="tel"
      slotProps={{
        htmlInput: {
          ...(props.slotProps?.htmlInput ?? {}),
          pattern: "[0-9]*",
          maxLength,
          inputMode: "numeric",
          autoComplete: "tel",
        },
        input: {
          ...(props.slotProps?.input ?? {}),
          startAdornment: iconStart && (
            <InputAdornment position="start">{iconStart}</InputAdornment>
          ),
        },
        ...props.slotProps,
      }}
      {...props}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        const isNumberKey = /^[0-9]$/.test(e.key);
        const isAllowedKey =
          e.key === "Backspace" ||
          e.key === "Delete" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === "Tab";

        if (!isNumberKey && !isAllowedKey) {
          e.preventDefault();
        }

        const input = e.currentTarget as HTMLInputElement;
        if (
          maxLength &&
          input.value.length >= maxLength &&
          isNumberKey &&
          !isAllowedKey
        ) {
          e.preventDefault();
        }
      }}
    />
  ),
  Autocomplete: InputAutocomplete,
  AutocompleteTag: InputAutocompleteTag,
});

export default Input;
