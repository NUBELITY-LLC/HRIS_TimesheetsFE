import { startTransition, type FormEvent } from "react";

export function submitKeepingValues(
  action: (data: FormData) => void,
  guard?: (event: FormEvent<HTMLFormElement>) => void,
) {
  return (event: FormEvent<HTMLFormElement>) => {
    guard?.(event);
    if (event.defaultPrevented) return;

    event.preventDefault();

    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const data = new FormData(event.currentTarget, submitter);

    startTransition(() => action(data));
  };
}
