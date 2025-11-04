import { Button } from "@/components/forms";
import DialogLayout from "@/components/layouts/DialogLayout";
import useStore from "@/store/useStore";
import { getLocalYMD } from "@/utils/date";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import {
  useForm,
  type SubmitErrorHandler,
  type SubmitHandler,
} from "react-hook-form";
import * as yup from "yup";
import { moods } from "../data/moods";

interface CreateMoodModalProps {
  open: boolean;
  onClose: () => void;
}

const schema = yup
  .object({
    moods: yup
      .array()
      .of(yup.string().required())
      .min(1, "Selecciona al menos 1 emoción")
      .max(3, "Solo puedes escoger hasta 3 emociones")
      .required()
      .defined(),
  })
  .required();

type FormValues = yup.InferType<typeof schema>;

const CreateMoodModal = ({ open, onClose }: CreateMoodModalProps) => {
  const currentUser = useStore((s) => s.authState.auth.currentUser);
  const showSnackbar = useStore((s) => s.showSnackbar);
  const { addMoodsForToday: addMoodForToday, getMoodsForDate } = useStore(
    (s) => s.moodsState,
  );

  const todayKey = new Date().toLocaleDateString("en-CA");
  const todaySelectedFromStore = getMoodsForDate(todayKey) ?? [];

  const {
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
    setValue,
    watch,
    register,
  } = useForm<FormValues>({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: { moods: todaySelectedFromStore },
  });

  useEffect(() => {
    if (open) {
      const current = getMoodsForDate(todayKey) ?? [];
      reset({ moods: current }, { keepErrors: false, keepDirty: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selected = watch("moods") ?? [];

  const handleSelectMood = (moodId: string) => {
    const current = getValues("moods") ?? [];
    const isSelected = current.includes(moodId);

    if (isSelected) {
      const next = current.filter((id) => id !== moodId);
      setValue("moods", next, { shouldDirty: true, shouldValidate: true });
      return;
    }

    if (current.length >= 3) {
      showSnackbar("Solo puedes escoger hasta 3 emociones por día", "warning");
      return;
    }

    const next = [...current, moodId];
    setValue("moods", next, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!currentUser || !currentUser.id) {
      showSnackbar("Algo salió mal con la sesión actual", "error");
      return;
    }

    const { year, month, day } = getLocalYMD();

    const moodsPayload = data.moods.map((moodId) => ({ moodId }));

    const res = await addMoodForToday({
      day,
      month,
      moods: moodsPayload,
      userId: currentUser.id,
      year,
    });

    if (!res.success) {
      showSnackbar(
        res.error ?? "No se pudieron registrar las emociones",
        "error",
      );
      return;
    }

    showSnackbar(
      res.message ?? "Emociones registradas correctamente",
      "success",
    );
    onClose();
  };

  const onInvalid: SubmitErrorHandler<FormValues> = () => {
    showSnackbar("Por favor corrige los campos marcados", "error");
  };

  return (
    <DialogLayout
      cancelButtonText="Cancelar"
      maxWidth="md"
      onClose={onClose}
      open={open}
      title="Registrar emoción"
      actions={
        <Button type="submit" onClick={handleSubmit(onSubmit, onInvalid)}>
          Confirmar emoción
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <input type="hidden" {...register("moods")} />

        <div className="mb-2">
          {errors.moods?.message && (
            <p className="text-sm text-red-600">
              {String(errors.moods.message)}
            </p>
          )}
        </div>

        <div className="mb-8 grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {moods.map((mood) => {
            const isSelected = selected.includes(mood.moodId);
            return (
              <button
                key={mood.moodId}
                type="button"
                onClick={() => handleSelectMood(mood.moodId)}
                aria-pressed={isSelected}
                className={`flex flex-col items-center rounded-xl border p-2 transition-all hover:-translate-y-1 hover:scale-110 ${
                  isSelected
                    ? `${mood.bgColor} text-white`
                    : "bg-white text-gray-700"
                }`}
              >
                {mood.Icon && (
                  <mood.Icon
                    className={isSelected ? "text-white" : mood.textColor}
                  />
                )}

                <span className="mt-2 text-sm font-medium">{mood.label}</span>
              </button>
            );
          })}
        </div>
      </form>
    </DialogLayout>
  );
};

export default CreateMoodModal;
