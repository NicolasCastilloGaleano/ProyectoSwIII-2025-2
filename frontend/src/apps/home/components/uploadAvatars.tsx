import { Avatar, ButtonBase } from "@mui/material";
import { useEffect, useState } from "react";

interface UploadAvatarsProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  size?: number;
  maxBytes?: number;
  onFileRejected?: (reason: string) => void;
}

const hiddenInputStyle: React.CSSProperties = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px",
};

const DEFAULT_MAX_BYTES = 800 * 1024; // ~800KB

const UploadAvatars = ({
  value,
  onChange,
  size = 120,
  maxBytes = DEFAULT_MAX_BYTES,
  onFileRejected,
}: UploadAvatarsProps) => {
  const [preview, setPreview] = useState<string | undefined>(
    value ?? undefined,
  );

  useEffect(() => {
    setPreview(value ?? undefined);
  }, [value]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > maxBytes) {
        onFileRejected?.(
          `El avatar supera el límite permitido (${Math.round(maxBytes / 1024)}KB).`,
        );
        // limpiar input para permitir volver a seleccionar el mismo archivo
        event.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const nextValue = reader.result as string;
        setPreview(nextValue);
        onChange?.(nextValue);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ButtonBase
      component="label"
      aria-label="Actualizar avatar"
      sx={{
        borderRadius: "40px",
        "&:has(:focus-visible)": {
          outline: "2px solid",
          outlineOffset: "2px",
        },
      }}
    >
      <Avatar
        alt="Avatar personalizado"
        src={preview}
        sx={{ width: size, height: size }}
      />
      <input
        type="file"
        accept="image/*"
        style={hiddenInputStyle}
        onChange={handleAvatarChange}
      />
    </ButtonBase>
  );
};

export default UploadAvatars;
