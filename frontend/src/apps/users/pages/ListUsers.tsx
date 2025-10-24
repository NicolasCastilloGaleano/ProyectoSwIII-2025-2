import { Button, Container } from "@/components/forms";
import { PRIVATEROUTES } from "@/routes/private.routes";
import useStore from "@/store/useStore";
import Add from "@mui/icons-material/Add";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { USER_NAMES } from "../data";

const ListUsers = () => {
  const [currentId, setCurrentId] = useState<string>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const { currentUser } = useStore((state) => state.authState.auth);
  const showSnackbar = useStore((state) => state.showSnackbar);

  const handleConfirm = async () => {
    if (!currentId) return;

    if (!currentUser || !currentUser.id) {
      showSnackbar("Algo salió mal con la sesión actual", "error");
      setTimeout(() => window.location.reload(), 1000);
      return;
    }

    setIsDeleting(true);
    try {
      // const res = await deleteUser(currentId, currentUser.id);
      const res = { success: true, message: "", error: "" };

      if (!res.success) {
        showSnackbar(res.error, "error");
        return;
      }

      showSnackbar(
        res.message || `${USER_NAMES.singular} eliminado correctamente`,
        "success",
      );

      // removeUser(currentId);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container label={USER_NAMES.plural}>
      <Container.Toolbar
        left={<></>}
        right={
          <Button
            startIcon={<Add />}
            onClick={() => navigate(PRIVATEROUTES.USERS_CREATE)}
          >
            Crear {USER_NAMES.singular}
          </Button>
        }
      />

      {/* {isModalOpen && (
        <ConfirmationModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          text={{
            title: `Eliminar ${USER_NAMES.singular}`,
            content: `¿Estás seguro de eliminar este ${USER_NAMES.singular}?`,
          }}
          handleConfirmModal={handleConfirm}
        />
      )} */}
    </Container>
  );
};

export default ListUsers;
