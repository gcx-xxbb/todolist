import { createContext } from 'react';

interface NotificationContextType {
  notification: { message: string; id: number } | null;
  setNotification: (messnotificationage: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);
