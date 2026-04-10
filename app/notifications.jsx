import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

const API_BASE = 'http://192.168.1.11:5000/api';

const TYPE_CONFIG = {
  leave_approved:   { icon: 'checkmark-circle', color: '#10b981', bg: '#dcfce7', label: 'Leave Approved' },
  leave_rejected:   { icon: 'close-circle',     color: '#ef4444', bg: '#fee2e2', label: 'Leave Rejected' },
  leave_pending:    { icon: 'time',              color: '#f59e0b', bg: '#fef9c3', label: 'Leave Pending' },
  announcement:     { icon: 'megaphone',         color: '#863ceb', bg: '#f5f3ff', label: 'Announcement' },
  attendance_in:    { icon: 'finger-print',      color: '#3b82f6', bg: '#dbeafe', label: 'Checked In' },
  attendance_out:   { icon: 'log-out',           color: '#6b7280', bg: '#f3f4f6', label: 'Checked Out' },
  system:           { icon: 'information-circle', color: '#0d0d0d', bg: '#f7f7f3', label: 'System' },
};

function timeAgo(dateStr) {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${diffDays}d ago`;
}

export default function Notifications() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const buildNotifications = async () => {
    try {
      setLoading(true);
      const employeeId = user?.id || user?._id;
      const allNotifs = [];

      // 1. Fetch leave requests for this employee
      const leaveRes = await fetch(`${API_BASE}/leave?employeeId=${employeeId}`);
      if (leaveRes.ok) {
        const leaves = await leaveRes.json();
        leaves.forEach(l => {
          let type = 'leave_pending';
          if (l.status === 'Approved') type = 'leave_approved';
          if (l.status === 'Rejected') type = 'leave_rejected';
          allNotifs.push({
            id: `leave_${l._id}`,
            type,
            title: `Leave ${l.status || 'Submitted'}`,
            body: `${l.type} • ${l.startDate} → ${l.endDate}`,
            time: l.createdAt || l.updatedAt || new Date().toISOString(),
          });
        });
      }

      // 2. Fetch announcements (top 5)
      const annRes = await fetch(`${API_BASE}/announcements`);
      if (annRes.ok) {
        const anns = await annRes.json();
        anns.slice(0, 5).forEach(a => {
          allNotifs.push({
            id: `ann_${a._id}`,
            type: 'announcement',
            title: a.pinned ? '📌 Pinned: ' + a.title : a.title,
            body: `${a.category} • ${a.authorName}`,
            time: a.createdAt,
          });
        });
      }

      // 3. Fetch own attendance records (last 5 days)
      const attRes = await fetch(`${API_BASE}/attendance/${employeeId}`);
      if (attRes.ok) {
        const att = await attRes.json();
        const records = Array.isArray(att) ? att : att.records || [];
        records.slice(0, 5).forEach(r => {
          if (r.checkIn && r.checkIn !== '-') {
            allNotifs.push({
              id: `att_in_${r._id}`,
              type: 'attendance_in',
              title: 'Checked In',
              body: `${r.date} at ${r.checkIn}`,
              time: r.createdAt || r.date,
            });
          }
          if (r.checkOut && r.checkOut !== '-') {
            allNotifs.push({
              id: `att_out_${r._id}`,
              type: 'attendance_out',
              title: 'Checked Out',
              body: `${r.date} at ${r.checkOut}`,
              time: r.createdAt || r.date,
            });
          }
        });
      }

      // Sort newest first
      allNotifs.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(allNotifs);
    } catch (err) {
      console.error('Notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buildNotifications();
  }, []);

  const renderItem = ({ item }) => {
    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
    return (
      <View style={[styles.card, { borderLeftColor: cfg.color }]}>
        <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={22} color={cfg.color} />
        </View>
        <View style={styles.textGroup}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.notifTime}>{timeAgo(item.time)}</Text>
        </View>
        <View style={[styles.typePill, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
          <Text style={[styles.typeText, { color: cfg.color }]}>
            {cfg.label.toUpperCase()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.hero}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#0d0d0d" />
        </TouchableOpacity>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>NOTIFICATIONS</Text>
          <Text style={styles.heroSub}>{notifications.length} recent events</Text>
        </View>
        <TouchableOpacity onPress={buildNotifications} style={styles.syncBtn}>
          <Ionicons name="sync" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#863ceb" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={buildNotifications} tintColor="#863ceb" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={56} color="#9ca3af" />
              <Text style={styles.emptyText}>ALL CAUGHT UP</Text>
              <Text style={styles.emptySub}>No activity events yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f3' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: {
    paddingTop: 54, paddingBottom: 18, paddingHorizontal: 20,
    backgroundColor: '#863ceb', borderBottomWidth: 4, borderColor: '#0d0d0d',
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  backButton: {
    width: 42, height: 42, backgroundColor: '#fff', borderWidth: 2.5,
    borderColor: '#0d0d0d', borderRadius: 8, alignItems: 'center',
    justifyContent: 'center', shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  syncBtn: {
    width: 42, height: 42, backgroundColor: '#0d0d0d', borderWidth: 2.5,
    borderColor: '#0d0d0d', borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  listContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 3,
    borderColor: '#0d0d0d', borderLeftWidth: 6,
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 14, gap: 12, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 10,
    borderWidth: 2, borderColor: '#0d0d0d',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  textGroup: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: '900', color: '#0d0d0d', letterSpacing: -0.2 },
  notifBody: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginTop: 3, lineHeight: 17 },
  notifTime: { fontSize: 10, fontWeight: '700', color: '#9ca3af', marginTop: 6, textTransform: 'uppercase' },
  typePill: {
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
    borderWidth: 1.5, alignSelf: 'flex-start', flexShrink: 0,
  },
  typeText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.3 },
  emptyState: { paddingTop: 100, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '900', color: '#0d0d0d', letterSpacing: 2 },
  emptySub: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },
});
