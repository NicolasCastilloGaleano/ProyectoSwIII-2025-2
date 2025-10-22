import { Autocomplete, type AutocompleteProps } from "@mui/material";
import { StyledTextField } from "./Input";

export type InputAutocompleteProps<T> = Omit<
  AutocompleteProps<T, false, false, false>,
  "renderInput"
> & {
  error?: boolean;
  helperText?: string;
  label?: string;
  name?: string;
  getOptionLabel: (option: T) => string;
  onChange: (
    event: React.SyntheticEvent<Element, Event>,
    value: T | null,
  ) => void;
};

type InputAutocompleteTagProps<T> = Omit<
  AutocompleteProps<T, true, false, false>,
  "renderInput"
> & {
  error?: boolean;
  helperText?: string;
  label?: string;
};

export const InputAutocomplete = <T,>({
  disabled,
  error,
  helperText,
  label,
  name,
  options,
  value,
  getOptionLabel,
  onChange,
  ...props
}: InputAutocompleteProps<T>) => (
  <Autocomplete
    disabled={disabled}
    fullWidth
    options={options}
    getOptionLabel={getOptionLabel}
    value={value}
    onChange={onChange}
    renderInput={(params) => (
      <StyledTextField
        {...params}
        name={name}
        disabled={disabled}
        error={error}
        fullWidth
        helperText={helperText}
        label={label}
        size="small"
      />
    )}
    {...props}
  />
);

export const InputAutocompleteTag = <T,>({
  disabled,
  error,
  helperText,
  label,
  options,
  value,
  getOptionLabel,
  isOptionEqualToValue,
  onChange,
  ...props
}: InputAutocompleteTagProps<T>) => (
  <Autocomplete
    disabled={disabled}
    fullWidth
    getOptionLabel={getOptionLabel}
    isOptionEqualToValue={isOptionEqualToValue}
    multiple
    onChange={onChange}
    options={options}
    value={value}
    renderInput={(params) => (
      <StyledTextField
        {...params}
        disabled={disabled}
        error={error}
        fullWidth
        helperText={helperText}
        label={label}
        size="small"
      />
    )}
    {...props}
  />
);
