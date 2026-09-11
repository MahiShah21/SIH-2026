import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationApi from '../../api/notificationApi';
import { getSocket } from '../../api/socket';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function UniversityHeader({
  pageTitle,
  subTitle,
  badgeText,
  onSearch,
  searchPlaceholder,
  onToggleMobileMenu
}) {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const defaultPageTitle = pageTitle || t('uni_dash_title', 'University Dashboard');
  const defaultSubTitle = subTitle || t('uni_dash_subtitle', 'Overview of assigned challenges, active projects and collaboration activity.');
  const defaultBadgeText = badgeText || t('uni_badge_portal', 'Active Portal');
  const defaultSearchPlaceholder = searchPlaceholder || t('search_placeholder', 'Search challenges, projects, grants, faculty...');
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [query, setQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [liveToast, setLiveToast] = useState(null);

  const userName = currentUser?.name || currentUser?.institution || 'University Lead';
  const userInitials = (userName || 'UL').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const userOrg = currentUser?.organization_or_district || currentUser?.institution || 'Academic Hub';

  const fetchLiveNotifications = async () => {
    try {
      const res = await notificationApi.getNotifications({ role: 'university' });
      if (res && res.success && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Error fetching university notifications:', err);
    }
  };

  useEffect(() => {
    fetchLiveNotifications();

    const socket = getSocket();
    if (socket) {
      socket.emit('join_role', 'university');

      const handleNewNotification = (notif) => {
        if (!notif) return;
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
        setLiveToast(notif);
        setTimeout(() => setLiveToast(null), 4000);
      };

      socket.on('new_notification', handleNewNotification);

      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, []);

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllAsRead('university');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.warn('Error marking notifications as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await notificationApi.markAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.warn('Error marking read:', err);
      }
    }
    setShowNotifications(false);
    if (notif.type === 'COLLABORATION') {
      navigate('/university/industry');
    } else if (notif.type === 'MESSAGE') {
      navigate('/university/communication');
    } else {
      navigate('/university/projects');
    }
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-slate-200/80 sticky top-0 z-20 bg-[#f4f5fa]/95 backdrop-blur-sm pt-1">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Open navigation menu"
            className="md:hidden p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-xs"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{defaultPageTitle}</h1>
            {defaultBadgeText && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {defaultBadgeText}
              </span>
            )}
          </div>
          {defaultSubTitle && (
            <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">{defaultSubTitle}</p>
          )}
        </div>
      </div>

      {/* Right Tools: Language Switcher, Search, Notification Bell, Interactive Top-Right Profile Dropdown */}
      <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
        <LanguageSwitcher />

        {onSearch && (
          <div className="relative hidden sm:block w-48 lg:w-60">
            <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              placeholder={defaultSearchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 shadow-2xs"
            />
          </div>
        )}

        {/* Notifications dropdown trigger */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileDropdown(false);
            }}
            className="p-2 rounded-lg bg-white border border-slate-200 shadow-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 relative focus:outline-none transition cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden text-left animate-in fade-in">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Research &amp; Grant Alerts</h3>
                  <p className="text-[11px] text-slate-500">{unreadCount} unread notices</p>
                </div>
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
                >
                  Mark all read
                </button>
              </div>

              <div className="overflow-y-auto max-h-[340px] divide-y divide-slate-100 text-xs">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    <p className="text-xs font-semibold">No notifications right now.</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Real-time alerts will appear automatically.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 ${
                        !notif.is_read ? 'bg-teal-50/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notif.is_read ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`font-bold leading-tight truncate ${!notif.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {notif.created_at ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed mb-1.5 line-clamp-2">{notif.message}</p>
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800">
                          {notif.type || 'NOTIFICATION'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Real-Time Live Notification Toast Popover */}
        {liveToast && (
          <div className="fixed top-4 right-4 z-50 bg-[#0b1329] text-white p-3.5 rounded-xl shadow-2xl border border-teal-500/40 flex items-start gap-3 max-w-sm animate-bounce">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5 border border-teal-400/30">
              ⚡
            </div>
            <div className="flex-1 text-xs">
              <p className="font-bold text-teal-300">{liveToast.title}</p>
              <p className="text-slate-300 text-[11px] mt-0.5 line-clamp-2">{liveToast.message}</p>
            </div>
            <button
              onClick={() => setLiveToast(null)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* ================= INTERACTIVE TOP-RIGHT PROFILE DROPDOWN ================= */}
        <div className="relative">
          <div
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-xs cursor-pointer hover:border-teal-400 transition"
          >
            <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xs">
              {userInitials}
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-[12px] font-bold text-slate-900 leading-tight">{userName}</div>
              <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                <span>{userOrg}</span>
              </div>
            </div>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Profile Dropdown Popover */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in">
              <div className="p-4 bg-gradient-to-br from-[#0d1927] to-[#09121d] text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/20">
                    {userInitials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{userName}</h4>
                    <p className="text-[11px] text-emerald-300">{userOrg}</p>
                  </div>
                </div>
              </div>

              <div className="p-2 space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate('/university/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition font-medium cursor-pointer"
                >
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>View Institution Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate('/university/communication');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition font-medium cursor-pointer"
                >
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>Stakeholder Communication</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition font-medium cursor-pointer"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Switch Portal / Role</span>
                </button>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition font-semibold cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
