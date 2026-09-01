import type { PropsWithChildren } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { store } from "@/store/store";
import { queryClient } from "@/services/query/queryClient";
import { SessionBootstrap } from "@/features/auth/SessionBootstrap";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <SessionBootstrap>{children}</SessionBootstrap>
        </QueryClientProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
