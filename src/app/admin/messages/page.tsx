'use client';

import { useEffect, useState } from 'react';
import styles from './Messages.module.css';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
      });

      const result = await response.json();

      if (result.success) {
        setMessages(result.messages || []);
      } else {
        console.error('Failed to load messages:', result.error);
        // If unauthorized, redirect to login
        if (response.status === 401) {
          window.location.href = '/admin/login';
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (messageId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId, status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        loadMessages();
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage({...selectedMessage, status: newStatus});
        }
      } else {
        console.error('Failed to update status:', result.error);
        alert('Failed to update message status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update message status');
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string, name: string) => {
    const subject = encodeURIComponent(`Re: Your message to Vedputra`);
    const body = encodeURIComponent(`Dear ${name},\n\nThank you for contacting Vedputra.\n\nBest regards,\nVedputra Team`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hello ${name}, thank you for reaching out to Vedputra! How can we help you?`);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/91${cleanPhone}?text=${message}`, '_blank');
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    return msg.status === filter;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: '#1976D2',
      read: '#7B1FA2',
      replied: '#2E7D32',
      archived: '#666',
    };
    return colors[status] || '#666';
  };

  return (
    <div className={styles.messagesPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Contact Messages</h1>
          <p className={styles.pageSubtitle}>Manage customer inquiries and support requests</p>
        </div>
        <button className={styles.refreshBtn} onClick={loadMessages}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{messages.length}</span>
          <span className={styles.statLabel}>Total Messages</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{messages.filter(m => m.status === 'new').length}</span>
          <span className={styles.statLabel}>New</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{messages.filter(m => m.status === 'read').length}</span>
          <span className={styles.statLabel}>Read</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{messages.filter(m => m.status === 'replied').length}</span>
          <span className={styles.statLabel}>Replied</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`}
          onClick={() => setFilter('all')}
        >
          All Messages
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'new' ? styles.filterActive : ''}`}
          onClick={() => setFilter('new')}
        >
          New
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'read' ? styles.filterActive : ''}`}
          onClick={() => setFilter('read')}
        >
          Read
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'replied' ? styles.filterActive : ''}`}
          onClick={() => setFilter('replied')}
        >
          Replied
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'archived' ? styles.filterActive : ''}`}
          onClick={() => setFilter('archived')}
        >
          Archived
        </button>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading messages...</p>
        </div>
      ) : filteredMessages.length > 0 ? (
        <div className={styles.messagesGrid}>
          {filteredMessages.map((message) => (
            <div key={message.id} className={styles.messageCard}>
              <div className={styles.messageHeader}>
                <div className={styles.messageInfo}>
                  <h3 className={styles.messageName}>{message.name}</h3>
                  <p className={styles.messageEmail}>{message.email}</p>
                  <p className={styles.messagePhone}>{message.phone}</p>
                </div>
                <div className={styles.messageStatus}>
                  <span 
                    className={styles.statusBadge}
                    style={{background: getStatusColor(message.status), color: 'white'}}
                  >
                    {message.status}
                  </span>
                  <span className={styles.messageDate}>
                    {new Date(message.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className={styles.messageBody}>
                <p>{message.message}</p>
              </div>

              <div className={styles.messageActions}>
                <button 
                  className={styles.actionBtn}
                  onClick={() => handleStatusUpdate(message.id, 'read')}
                  title="Mark as Read"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Read</span>
                </button>

                <button 
                  className={styles.actionBtn}
                  onClick={() => handleEmail(message.email, message.name)}
                  title="Reply via Email"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>Email</span>
                </button>

                <button 
                  className={styles.actionBtn}
                  onClick={() => handleCall(message.phone)}
                  title="Call Customer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>Call</span>
                </button>

                <button 
                  className={styles.actionBtn}
                  onClick={() => handleWhatsApp(message.phone, message.name)}
                  title="WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>WhatsApp</span>
                </button>

                <button 
                  className={`${styles.actionBtn} ${styles.primaryBtn}`}
                  onClick={() => handleStatusUpdate(message.id, 'replied')}
                  title="Mark as Replied"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  <span>Replied</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3>No Messages Found</h3>
          <p>There are no messages matching your filters.</p>
        </div>
      )}
    </div>
  );
}

