import { useEffect, useState } from "react";

type Tema = "light" | "dark";

function temaInicial(): Tema {
  try {
    const guardado = localStorage.getItem("ep-theme");
    if (guardado === "light" || guardado === "dark") return guardado;
  } catch {
    // sin acceso a localStorage
  }

  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function useTheme() {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    try {
      localStorage.setItem("ep-theme", tema);
    } catch {
      // sin acceso a localStorage
    }
  }, [tema]);

  const alternar = () => setTema((prev) => (prev === "dark" ? "light" : "dark"));

  return { tema, alternar };
}
