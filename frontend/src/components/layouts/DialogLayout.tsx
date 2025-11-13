/* eslint-disable @typescript-eslint/no-explicit-any */
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
  "& .MuiPaper-root": {
    margin: 16,
    borderRadius: 24,
    border: "1px solid #F3F4F6",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    [theme.breakpoints.up("md")]: {
      margin: 32,
      borderRadius: 28,
    },
  },
  "& .MuiDialogContent-root": {
    padding: "16px 16px",
    [theme.breakpoints.up("md")]: {
      padding: "20px 24px",
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
          py: 2,
          px: 3,
          mb: 0,
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent>{children}</DialogContent>

      {!hideActions && (
        <DialogActionsBetween
          sx={{
            borderTop: "1px solid #F3F4F6",
            paddingTop: 2,
            paddingBottom: 2,
          }}
        >
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
