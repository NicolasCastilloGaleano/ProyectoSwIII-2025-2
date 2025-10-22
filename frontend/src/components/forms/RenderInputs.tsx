/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormField } from "@/interfaces/FormField";
import {
  Checkbox,
  FormControlLabel,
  MenuItem,
  Typography,
} from "@mui/material";
import get from "lodash/get";
import {
  type Control,
  Controller,
  type ControllerRenderProps,
  type FieldErrors,
} from "react-hook-form";
import Input from "./Input";

interface RenderInputProps {
  fieldConfig: FormField;
  control: Control<any>;
  errors: FieldErrors<any>;
  disabled?: boolean;
  field?: ControllerRenderProps<any, string>;
}

const RenderInputs = ({
  control,
  disabled = false,
  errors,
  fieldConfig,
}: RenderInputProps) => {
  const { name, label, type, notFullWidth } = fieldConfig;

  const error = get(errors, name);
  const helperText = error?.message as string;

  if (type === "checkbox") {
    return (
      <>
        <FormControlLabel
          control={
            <Controller
              name={name}
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={disabled}
                />
              )}
            />
          }
          label={label}
          sx={{ fontSize: "0.8rem", color: "text.secondary" }}
        />
        {error && <Typography color="error">{helperText}</Typography>}
      </>
    );
  }

  const commonProps = {
    name,
    control,
    render: ({ field }: any) => {
      const inputProps = {
        ...field,
        disabled,
        label,
        fullWidth: notFullWidth ? false : true,
        error: !!error,
        helperText,
      };

      switch (type) {
        case "text":
          return <Input {...inputProps} />;
        case "textarea":
          return <Input.TextArea {...inputProps} size="small" rows={3} />;
        case "icon":
          return <Input.Icon {...inputProps} iconStart={fieldConfig.icon} />;
        case "date":
          return <Input.Date {...inputProps} />;
        case "datetime":
          return <Input.DateTime {...inputProps} />;
        case "number":
          return <Input.Number {...inputProps} iconStart={fieldConfig.icon} />;
        case "password":
          return <Input.Password {...inputProps} />;
        case "phone":
          return (
            <Input.Phone
              {...inputProps}
              iconStart={fieldConfig.icon}
              maxLength={fieldConfig.maxLength}
            />
          );
        case "select":
          return (
            <Input.Select {...inputProps}>
              {fieldConfig.options.map((option) => {
                const value =
                  typeof option === "string" ? option : option.value;
                const label =
                  typeof option === "string" ? option : option.label;
                return (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                );
              })}
            </Input.Select>
          );
        case "selectIcon":
          return (
            <Input.SelectIcon {...inputProps} iconStart={fieldConfig.icon}>
              {fieldConfig.options.map((option) => {
                const value =
                  typeof option === "string" ? option : option.value;
                const label =
                  typeof option === "string" ? option : option.label;
                return (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                );
              })}
            </Input.SelectIcon>
          );
        case "autocomplete": {
          const opts = fieldConfig.options;
          const isObjectOptions =
            Array.isArray(opts) && typeof opts[0] === "object";
          const selectedValue = isObjectOptions
            ? opts.find((opt: any) => opt.id === field.value) || null
            : field.value || null;

          const handleChange = (_: any, value: any) => {
            if (isObjectOptions) {
              field.onChange(value?.id ?? "");
            } else {
              field.onChange(value ?? "");
            }
          };

          return (
            <Input.Autocomplete
              label={label}
              options={opts as any}
              value={selectedValue as any}
              onChange={handleChange}
              getOptionLabel={fieldConfig.getOptionLabel as any}
              isOptionEqualToValue={fieldConfig.isOptionEqualToValue as any}
              renderOption={fieldConfig.renderOption as any}
              error={!!error}
              helperText={helperText}
              disabled={disabled}
            />
          );
        }
        case "autocompleteTag":
          return (
            <Input.AutocompleteTag
              label={label}
              options={fieldConfig.options}
              value={field.value || []}
              onChange={(_: any, value: any) => field.onChange(value)}
              getOptionLabel={fieldConfig.getOptionLabel}
              isOptionEqualToValue={fieldConfig.isOptionEqualToValue}
              renderOption={fieldConfig.renderOption as any}
              error={!!error}
              helperText={helperText}
            />
          );
      }
    },
  };

  return <Controller {...commonProps} />;
};

export default RenderInputs;
