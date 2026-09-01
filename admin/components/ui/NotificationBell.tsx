'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAuthStore, useNotificationStore } from '@/lib/store';
import { notificationsApi } from '@/lib/api';

const STATUS_ICONS: Record<string, string> = {
  PENDING: '🛍️',
  CONFIRMED: '✅',
  PROCESSING: '⚙️',
  SHIPPED: '🚚',
  OUT_FOR_DELIVERY: '📦',
  DELIVERED: '🎉',
  CANCELLED: '❌',
};

const timeAgo = (dateStr: string): string => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export default function NotificationBell() {
  const { isAuthenticated } = useAuthStore();
  const { items, unreadCount, isOpen, setItems, setUnreadCount, markRead, markAllRead, toggle, close } =
    useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnread = () => {
      notificationsApi
        .getUnreadCount()
        .then(({ data }) => setUnreadCount(data.data.count))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, setUnreadCount]);

  useEffect(() => {
    if (!isOpen) return;
    notificationsApi
      .getAll()
      .then(({ data }) => setItems(data.data))
      .catch(() => {});
  }, [isOpen, setItems]);

  if (!isAuthenticated) return null;

  const handleItemClick = (id: string, isRead: boolean) => {
    if (isRead) return;
    markRead(id);
    notificationsApi.markRead(id).catch(() => {});
  };

  const handleMarkAllRead = () => {
    markAllRead();
    notificationsApi.markAllRead().catch(() => {});
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-fade-in z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 mb-1">
            <p className="font-semibold text-sm">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-brand-600 font-medium hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No notifications yet</p>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  href={n.orderId ? `/orders/${n.orderId}` : '/orders'}
                  onClick={() => {
                    handleItemClick(n.id, n.isRead);
                    close();
                  }}
                  className={`flex gap-3 px-4 py-3 hover:bg-brand-50 transition-colors ${
                    !n.isRead ? 'bg-brand-50/60' : ''
                  }`}
                >
                  <span className="text-lg leading-none">{STATUS_ICONS[n.status || ''] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 bg-brand-600 rounded-full flex-shrink-0 mt-1.5" />}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
