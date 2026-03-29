import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { directorStore } from "../lib/directorStore";

interface DirectorSettings {
  safeMode: boolean;
  directorNote: string;
  setSafeMode: (v: boolean) => void;
  setDirectorNote: (v: string) => void;
}

const DirectorContext = createContext<DirectorSettings>({
  safeMode: false,
  directorNote: "",
  setSafeMode: () => {},
  setDirectorNote: () => {},
});

export function useDirector() {
  return useContext(DirectorContext);
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function DirectorProvider({ children }: { children: ReactNode }) {
  const [safeMode, _setSafeMode] = useState<boolean>(() => load("director_safeMode", false));
  const [directorNote, _setDirectorNote] = useState<string>(() => load("director_note", ""));

  function setSafeMode(v: boolean) {
    _setSafeMode(v);
    directorStore.safeMode = v;
    localStorage.setItem("director_safeMode", JSON.stringify(v));
  }

  function setDirectorNote(v: string) {
    _setDirectorNote(v);
    directorStore.directorNote = v;
    localStorage.setItem("director_note", JSON.stringify(v));
  }

  useEffect(() => {
    directorStore.safeMode = safeMode;
    directorStore.directorNote = directorNote;
  }, []);

  return (
    <DirectorContext.Provider value={{ safeMode, directorNote, setSafeMode, setDirectorNote }}>
      {children}
    </DirectorContext.Provider>
  );
}
