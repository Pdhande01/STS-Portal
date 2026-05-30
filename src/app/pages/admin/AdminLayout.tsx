import { Outlet, useNavigate } from "react-router";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { useAuth } from "../../../contexts/AuthContext";
import { Bell, Search, User, Wrench, ShoppingBag } from "lucide-react";
import { Input } from "../../components/ui/input";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";

interface NotificationItem {
  id: string;
  type: 'service' | 'order';
  title: string;
  description: string;
  time: string;
  read: boolean;
  link: string;
}

export function AdminLayout() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const [reqsRes, ordersRes] = await Promise.all([
        supabase
          .from('service_requests')
          .select(`
            id,
            brand,
            model,
            status,
            created_at,
            profiles (full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            created_at,
            profiles (full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const items: NotificationItem[] = [];

      if (reqsRes.data) {
        reqsRes.data.forEach((r: any) => {
          const customerName = r.profiles?.full_name || 'Customer';
          items.push({
            id: `req-${r.id}`,
            type: 'service',
            title: 'New Service Request',
            description: `${customerName} booked repair for ${r.brand} ${r.model} (${r.status})`,
            time: r.created_at,
            read: false,
            link: '/admin/services'
          });
        });
      }

      if (ordersRes.data) {
        ordersRes.data.forEach((o: any) => {
          const customerName = o.profiles?.full_name || 'Customer';
          items.push({
            id: `ord-${o.id}`,
            type: 'order',
            title: 'New Store Order',
            description: `${customerName} placed order for ₹${o.total_amount.toLocaleString()}`,
            time: o.created_at,
            read: false,
            link: '/admin/orders'
          });
        });
      }

      // Sort items by time descending
      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      // Limit to top 5
      const recentItems = items.slice(0, 5);
      
      // Load read status from localStorage
      const readIds = JSON.parse(localStorage.getItem('sts_read_notifs') || '[]');
      let unread = 0;
      const finalized = recentItems.map(item => {
        const isRead = readIds.includes(item.id);
        if (!isRead) unread++;
        return { ...item, read: isRead };
      });

      setNotifications(finalized);
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Set up polling for new notifications every 10 seconds
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    const readIds = JSON.parse(localStorage.getItem('sts_read_notifs') || '[]');
    notifications.forEach(item => {
      if (!readIds.includes(item.id)) {
        readIds.push(item.id);
      }
    });
    localStorage.setItem('sts_read_notifs', JSON.stringify(readIds));
    
    setNotifications(notifications.map(item => ({ ...item, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    const readIds = JSON.parse(localStorage.getItem('sts_read_notifs') || '[]');
    if (!readIds.includes(item.id)) {
      readIds.push(item.id);
      localStorage.setItem('sts_read_notifs', JSON.stringify(readIds));
    }
    
    setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: true } : n));
    const newUnread = notifications.reduce((sum, n) => {
      const isRead = n.id === item.id || readIds.includes(n.id);
      return sum + (isRead ? 0 : 1);
    }, 0);
    setUnreadCount(newUnread);

    setDropdownOpen(false);
    navigate(item.link);
  };

  function formatRelativeTime(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search anything..." 
                className="pl-10 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-purple-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer rounded-lg hover:bg-gray-100/80"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                    <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                          {unreadCount} New
                        </span>
                      )}
                    </span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs text-purple-600 hover:text-purple-700 font-bold hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50">
                    {notifications.length > 0 ? (
                      notifications.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${
                            !item.read ? 'bg-purple-50/20' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${
                            item.type === 'service' 
                              ? 'bg-purple-50 text-purple-600 border-purple-100' 
                              : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {item.type === 'service' ? (
                              <Wrench className="w-4 h-4" />
                            ) : (
                              <ShoppingBag className="w-4 h-4" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              <p className={`text-xs font-bold text-gray-900 truncate ${
                                !item.read ? 'text-purple-900' : ''
                              }`}>
                                {item.title}
                              </p>
                              <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">
                                {formatRelativeTime(item.time)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 font-normal line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                          <Bell className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-gray-800 text-xs">No Notifications</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 max-w-[180px]">
                          You're all caught up! No recent system updates.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold border border-purple-200">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
