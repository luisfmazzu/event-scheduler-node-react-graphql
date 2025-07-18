import type { Metadata } from 'next';
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ConnectionStatusToast } from '../components/ui/ConnectionStatus';
import './globals.css';

export const metadata: Metadata = {
  title: 'Event Scheduler',
  description: 'A GraphQL and Relay demo application for event scheduling',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <ConnectionStatusToast />
        </AuthProvider>
      </body>
    </html>
  );
} 