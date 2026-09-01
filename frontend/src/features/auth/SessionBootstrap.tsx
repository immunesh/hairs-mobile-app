import type { PropsWithChildren } from "react";

import { useSessionBootstrap } from "./hooks";

/** Restores the persisted session before the app renders its navigator. */
export function SessionBootstrap({ children }: PropsWithChildren) {
  const isReady = useSessionBootstrap();

  if (!isReady) return null;

  return <>{children}</>;
}
