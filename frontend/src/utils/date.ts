export const getLocalYMD = (d = new Date()) => {
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return { year: y, month: m, day, ymd: `${y}-${m}-${day}` };
};
