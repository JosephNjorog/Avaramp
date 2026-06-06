import { useEffect, useState } from "react";

export function useFirstVisit(key: string): { show: boolean; dismiss: () => void } {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(`avaramp_tutorial_${key}_done`)) {
      setShow(true);
    }
  }, [key]);

  function dismiss() {
    localStorage.setItem(`avaramp_tutorial_${key}_done`, "1");
    setShow(false);
  }

  return { show, dismiss };
}
