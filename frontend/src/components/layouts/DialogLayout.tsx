/* eslint-disable @typescript-eslint/no-explicit-any */
import { SOFTWARE_THEME } from "@/config";
import {
  type Breakpoint,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  Slide,
  styled,
  Typography,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import React from "react";
import { Button } from "../forms";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface DialogLayoutProps extends DialogProps {
  actions?: React.ReactNode;
  cancelButtonText?: string;
  children: React.ReactNode;
  fullWidthCancelButton?: boolean;
  hideActions?: boolean;
  open: boolean;
  title: string;
  maxWidth: Breakpoint;
  onClose: () => void;
}

const DialogCSS = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: "16px 12px ",
    [theme.breakpoints.up("md")]: {
      padding: "16px 20px",
    },
  },
  "& .css-pdteti-MuiPaper-root-MuiDialog-paper": {
    margin: "16px",
    [theme.breakpoints.up("md")]: {
      margin: "32px",
    },
  },
}));

const DialogActionsBetween = styled(DialogActions)(({ theme }) => ({
  display: "flex",
  flexDirection: "column-reverse",
  justifyContent: "space-between",
  gap: "12px",
  padding: "16px 24px",
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
    alignItems: "center",
  },
}));

const DialogLayout = (props: DialogLayoutProps) => {
  const {
    actions,
    cancelButtonText,
    children,
    fullWidthCancelButton = false,
    hideActions = false,
    open,
    title,
    maxWidth,
    onClose,
    ...rest
  } = props;

  const handleClose = () => {
    onClose();
  };

  return (
    <DialogCSS
      aria-describedby="alert-dialog-slide-description"
      fullWidth
      keepMounted
      maxWidth={maxWidth}
      onClose={handleClose}
      open={open}
      slots={{
        transition: Transition,
      }}
      {...rest}
    >
      <DialogTitle
        sx={{
          background: SOFTWARE_THEME.primary,
          color: "white",
          textAlign: "center",
          py: 2,
          mb: 2,
        }}
      >
        <Typography variant="h5" component="div">
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent>{children}</DialogContent>

      {!hideActions && (
        <DialogActionsBetween>
          <Button.Error onClick={handleClose} fullWidth={fullWidthCancelButton}>
            {cancelButtonText || "Cancelar"}
          </Button.Error>
          {actions}
        </DialogActionsBetween>
      )}
    </DialogCSS>
  );
};

export default DialogLayout;
