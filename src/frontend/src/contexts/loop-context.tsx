import { createContext, useContext, useState, type ReactNode } from "react";

interface LoopContextValue {
  activeLoop: string;
  setActiveLoop: (loop: string) => void;
}

const LoopContext = createContext<LoopContextValue>({
  activeLoop: "default",
  setActiveLoop: () => {},
});

export function LoopProvider({ children }: { children: ReactNode }) {
  const [activeLoop, setActiveLoop] = useState("default");
  return (
    <LoopContext.Provider value={{ activeLoop, setActiveLoop }}>
      {children}
    </LoopContext.Provider>
  );
}

export function useActiveLoop() {
  return useContext(LoopContext);
}
