import { tw } from "~/utils/tw";

export const buttonStyles = tw(
  "flex items-center justify-center gap-2",
  "rounded-lg bg-neutral-100 px-5 py-2.5",
  "text-sm font-semibold text-neutral-900",
  "outline-offset-1 transition hover:bg-white active:scale-[0.98]",
);
