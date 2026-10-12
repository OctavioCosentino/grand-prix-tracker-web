export function formatRaceDates(dates: string[]): string {
  if (!dates || dates.length < 2) return "";

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const [d1, m1, y1] = dates[0].split("/");
  const [d2, m2, y2] = dates[1].split("/");

  const day1 = parseInt(d1, 10);
  const day2 = parseInt(d2, 10);

  const month1Name = months[parseInt(m1, 10) - 1];
  const month2Name = months[parseInt(m2, 10) - 1];

  if (m1 === m2 && y1 === y2) {
    return `${day1} - ${day2} ${month2Name}, ${y2}`;
  }
  if (m1 !== m2 && y1 === y2) {
    return `${day1} ${month1Name} - ${day2} ${month2Name}, ${y2}`;
  }
  return `${day1} ${month1Name} ${y1} - ${day2} ${month2Name} ${y2}`;
}
