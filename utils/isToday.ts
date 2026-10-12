export const isToday = (dateString?: string) => {
  if (!dateString) return false;

  const today = new Date();
  const raceDate = new Date(dateString);

  return (
    today.getDate() === raceDate.getDate() &&
    today.getMonth() === raceDate.getMonth() &&
    today.getFullYear() === raceDate.getFullYear()
  );
};
