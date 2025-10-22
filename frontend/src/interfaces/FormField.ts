/* eslint-disable @typescript-eslint/no-explicit-any */
import type { HTMLAttributes, ReactNode } from "react";

export type FieldType =
  | "autocomplete"
  | "autocompleteTag"
  | "checkbox"
  | "date"
  | "datetime"
  | "icon"
  | "number"
  | "password"
  | "phone"
  | "select"
  | "selectIcon"
  | "text"
  | "textarea";

interface BaseField {
  name: string;
  label: string;
  type: FieldType;
  notFullWidth?: true;
}

interface AutocompleteTagField<T = any> extends BaseField {
  type: "autocompleteTag";
  options: T[];
  getOptionLabel: (item: T) => string;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  renderOption?: (props: HTMLAttributes<HTMLLIElement>, option: T) => ReactNode;
}

interface AutocompleteField<T = any> extends BaseField {
  type: "autocomplete";
  options: T[];
  getOptionLabel: (item: T) => string;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  renderOption?: (props: HTMLAttributes<HTMLLIElement>, option: T) => ReactNode;
}

interface BasicInputField extends BaseField {
  type: "checkbox" | "date" | "datetime" | "text" | "textarea";
}

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectField extends BaseField {
  type: "select" | "selectIcon";
  options: (string | SelectOption)[];
  icon?: ReactNode;
}

interface NumberField extends BaseField {
  type: "number";
  icon?: ReactNode;
}

interface IconField extends BaseField {
  type: "icon";
  icon: ReactNode;
}

interface PasswordField extends BaseField {
  type: "password";
  icon?: ReactNode;
}

interface PhoneField extends BaseField {
  type: "phone";
  icon?: ReactNode;
  maxLength: number;
}

/**
 * Estructura general del campo del formulario.
 */
export type FormField =
  | AutocompleteField
  | AutocompleteTagField
  | BasicInputField
  | IconField
  | NumberField
  | PasswordField
  | PhoneField
  | SelectField;

export interface FormLabel {
  label: string;
  formFields: FormField[];
}

export interface BasicFormRow {
  formFields: FormField[];
}

export type FormRow = FormLabel | BasicFormRow;
