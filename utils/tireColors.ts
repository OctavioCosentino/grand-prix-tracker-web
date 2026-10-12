export const tireColors = {
  soft: "#E10600",
  medium: "#E7B33C",
  hard: "#F3F1EA",
  inter: "#00A651",
  full_wet: "#0054A6",
};

export default function getRandomCompound() {
  const compounds = Object.keys(tireColors);
  const randomIndex = Math.floor(Math.random() * compounds.length);
  return String(compounds[randomIndex]);
}
