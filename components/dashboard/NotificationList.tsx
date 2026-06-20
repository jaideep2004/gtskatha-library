'use client';

import { useState } from 'react';

interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
}

export default function NotificationList({
  initialNotifications,
}: {
  initialNotifications: DashboardNotification[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);

  async function markRead(id: string) {
    setNotifications((items) => items.map((item) => (
      item.id === id ? { ...item, isRead: true } : item
    )));
    const response = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    });
    if (!response.ok) {
      setNotifications((items) => items.map((item) => (
        item.id === id ? { ...item, isRead: false } : item
      )));
    }
  }

  if (!notifications.length) {
    return <div className="ud-empty">No notifications yet.</div>;
  }

  return (
    <>
      <div className="notification-list">
        {notifications.map((notification) => (
          <button
            type="button"
            key={notification.id}
            className={notification.isRead ? '' : 'unread'}
            onClick={() => {
              if (!notification.isRead) void markRead(notification.id);
            }}
          >
            <span aria-hidden>●</span>
            <div>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
            </div>
            {!notification.isRead && <small>Mark read</small>}
          </button>
        ))}
      </div>
      <style>{`
        .notification-list { display: flex; flex-direction: column; gap: 9px; }
        .notification-list button { width: 100%; display: grid; grid-template-columns: 16px 1fr auto; gap: 8px; padding: 9px 0; border: 0; border-bottom: 1px solid #f0ede7; background: transparent; text-align: left; cursor: default; }
        .notification-list button.unread { cursor: pointer; }
        .notification-list button > span { color: #aeb4bd; }
        .notification-list button.unread > span { color: #d98c1b; }
        .notification-list strong { font-size: 13px; }
        .notification-list p { font-size: 11px; line-height: 1.5; margin-top: 4px; color: #687280; }
        .notification-list small { font-size: 10px; color: #b56d0d; white-space: nowrap; }
        .notification-list button:focus-visible { outline: 2px solid #d98c1b; outline-offset: 3px; }
      `}</style>
    </>
  );
}
