'use client';

import { ReactNode } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import environment from './RelayEnvironment';

interface RelayProviderProps {
  children: ReactNode;
}

export function RelayProvider({ children }: RelayProviderProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      {children}
    </RelayEnvironmentProvider>
  );
} 