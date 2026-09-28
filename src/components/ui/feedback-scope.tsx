"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
} from "react";

type FeedbackContextValue = {
  owner: string | null;
  claim: (id: string) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackScope({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [scope, setScope] = useState<{ path: string; owner: string | null }>({
    path: pathname,
    owner: null,
  });

  if (scope.path !== pathname) {
    setScope({ path: pathname, owner: null });
  }

  const claim = useCallback(
    (id: string) => setScope((current) => ({ ...current, owner: id })),
    [],
  );

  return (
    <FeedbackContext.Provider value={{ owner: scope.owner, claim }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedbackSlot() {
  const id = useId();
  const context = useContext(FeedbackContext);
  const visible = !context || context.owner === null || context.owner === id;

  function track<Payload>(action: (payload: Payload) => void) {
    return (payload: Payload) => {
      context?.claim(id);
      action(payload);
    };
  }

  return { visible, claim: () => context?.claim(id), track };
}
