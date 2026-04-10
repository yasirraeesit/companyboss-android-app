import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'http://192.168.1.11:5000/api/employees';

const DEPT_COLORS = {
  Engineering: '#863ceb',
  Product: '#10b981',
  Design: '#8b5cf6',
  'Human Resources': '#f59e0b',
  Sales: '#ef4444',
  Marketing: '#f97316',
  Finance: '#3b82f6',
};

const TIMELINE_ICONS = {
  Hired: '🚀',
  Promotion: '⬆️',
  Award: '🏆',
  Training: '📚',
  Milestone: '🎯',
};

const STATUS_COLORS = {
  Active: '#dcfce7',
  'On Leave': '#fef9c3',
  Inactive: '#fee2e2',
};

export default function EmployeeProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`${API_BASE}/${id}`);
        const data = await res.json();
        setEmployee(data);
      } catch (err) {
        console.error('Profile fetch error:', err);
        Alert.alert('Error', 'Could not load employee profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleCall = () => {
    if (employee?.phone) {
      Linking.openURL(`tel:${employee.phone}`);
    }
  };

  const handleEmail = () => {
    if (employee?.email) {
      Linking.openURL(`mailto:${employee.email}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#863ceb" />
      </View>
    );
  }

  if (!employee) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>EMPLOYEE NOT FOUND</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const deptColor = DEPT_COLORS[employee.department] || '#6b7280';
  const joinYear = employee.joinDate ? new Date(employee.joinDate).getFullYear() : 'N/A';
  const yearsAtCompany = employee.joinDate
    ? new Date().getFullYear() - new Date(employee.joinDate).getFullYear()
    : 0;

  return (
    <View style={styles.container}>
      {/* Hero Header */}
      <View style={[styles.hero, { backgroundColor: deptColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.heroBack}>
          <Ionicons name="arrow-back" size={22} color="#0d0d0d" />
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>{employee.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{employee.name}</Text>
            <Text style={styles.heroTitle}>{employee.jobTitle}</Text>
            <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[employee.status] || '#e5e7eb' }]}>
              <Text style={styles.statusPillText}>{employee.status}</Text>
            </View>
          </View>
        </View>

        {/* Stats Strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{employee.department}</Text>
            <Text style={styles.statLabel}>DEPT</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{employee.role}</Text>
            <Text style={styles.statLabel}>ROLE</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{yearsAtCompany > 0 ? `${yearsAtCompany}yrs` : `${joinYear}`}</Text>
            <Text style={styles.statLabel}>TENURE</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Contact Actions */}
        <View style={styles.contactRow}>
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#863ceb' }]} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.contactBtnText}>CALL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#0d0d0d' }]} onPress={handleEmail}>
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={styles.contactBtnText}>EMAIL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#f6d140' }]}
            onPress={() => Linking.openURL(`mailto:${employee.email}?subject=Hey ${employee.name.split(' ')[0]}!`)}>
            <Ionicons name="chatbubble" size={20} color="#0d0d0d" />
            <Text style={[styles.contactBtnText, { color: '#0d0d0d' }]}>MESSAGE</Text>
          </TouchableOpacity>
        </View>

        {/* Bio Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACT INFO</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color="#863ceb" />
              <Text style={styles.infoValue}>{employee.email}</Text>
            </View>
            {employee.phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={18} color="#863ceb" />
                <Text style={styles.infoValue}>{employee.phone}</Text>
              </View>
            )}
            {employee.joinDate && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={18} color="#863ceb" />
                <Text style={styles.infoValue}>Joined {new Date(employee.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={18} color="#863ceb" />
              <Text style={styles.infoValue}>{employee.department}</Text>
            </View>
          </View>
        </View>

        {/* Leave Balances */}
        {employee.leaveBalances && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LEAVE BALANCES</Text>
            <View style={styles.leaveRow}>
              {[
                { label: 'ANNUAL', value: employee.leaveBalances.annual ?? 20, color: '#863ceb' },
                { label: 'SICK', value: employee.leaveBalances.sick ?? 10, color: '#f6d140' },
                { label: 'CASUAL', value: employee.leaveBalances.casual ?? 5, color: '#10b981' },
              ].map(item => (
                <View key={item.label} style={[styles.leaveBox, { borderColor: item.color }]}>
                  <Text style={[styles.leaveValue, { color: item.color }]}>{item.value}</Text>
                  <Text style={styles.leaveLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Skills */}
        {employee.skills && employee.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SKILLS MATRIX</Text>
            <View style={styles.skillsCard}>
              {employee.skills.map((skill, i) => (
                <View key={i} style={styles.skillRow}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text style={styles.skillPct}>{skill.level}%</Text>
                  </View>
                  <View style={styles.skillBar}>
                    <View style={[styles.skillFill, { width: `${skill.level}%`, backgroundColor: deptColor }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Timeline */}
        {employee.timeline && employee.timeline.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CAREER TIMELINE</Text>
            <View style={styles.timelineCard}>
              {employee.timeline.map((event, i) => (
                <View key={i} style={styles.timelineItem}>
                  <View style={styles.timelineRailCol}>
                    <View style={[styles.timelineDot, { backgroundColor: deptColor }]}>
                      <Text style={styles.timelineEmoji}>{TIMELINE_ICONS[event.type] || '📌'}</Text>
                    </View>
                    {i < employee.timeline.length - 1 && <View style={[styles.timelineRail, { backgroundColor: deptColor }]} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineType}>{event.type}</Text>
                    <Text style={styles.timelineDesc}>{event.description}</Text>
                    <Text style={styles.timelineDate}>{event.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f3' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  errorText: { fontSize: 16, fontWeight: '900', color: '#0d0d0d', letterSpacing: 1 },
  backBtn: {
    backgroundColor: '#863ceb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: '#0d0d0d',
  },
  backBtnText: { color: '#fff', fontWeight: '900' },
  hero: {
    paddingTop: 54,
    paddingBottom: 0,
    borderBottomWidth: 4,
    borderColor: '#0d0d0d',
  },
  heroBack: {
    position: 'absolute',
    top: 54,
    left: 20,
    width: 42,
    height: 42,
    backgroundColor: '#fff',
    borderWidth: 2.5,
    borderColor: '#0d0d0d',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    zIndex: 10,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 16,
    marginLeft: 54,
  },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0d0d0d',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  heroAvatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  heroInfo: { flex: 1, paddingTop: 4 },
  heroName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  heroTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0d0d0d',
    marginTop: 8,
  },
  statusPillText: { fontSize: 9, fontWeight: '900', color: '#0d0d0d', textTransform: 'uppercase' },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#0d0d0d',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 13, fontWeight: '900', color: '#f6d140', textTransform: 'uppercase' },
  statLabel: { fontSize: 9, fontWeight: '700', color: '#fff', marginTop: 2, letterSpacing: 1 },
  statDivider: { width: 2, backgroundColor: '#333', marginVertical: 4 },
  scrollContent: { padding: 20 },
  contactRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#0d0d0d',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  contactBtnText: { fontSize: 11, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0d0d0d',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#0d0d0d',
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#0d0d0d', flex: 1 },
  leaveRow: { flexDirection: 'row', gap: 12 },
  leaveBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  leaveValue: { fontSize: 32, fontWeight: '900' },
  leaveLabel: { fontSize: 9, fontWeight: '900', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  skillsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#0d0d0d',
    padding: 20,
    gap: 18,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  skillRow: { gap: 8 },
  skillHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skillName: { fontSize: 14, fontWeight: '800', color: '#0d0d0d' },
  skillPct: { fontSize: 14, fontWeight: '900', color: '#863ceb' },
  skillBar: {
    height: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    overflow: 'hidden',
  },
  skillFill: { height: '100%', borderRadius: 4 },
  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#0d0d0d',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  timelineItem: { flexDirection: 'row', gap: 16, paddingBottom: 4 },
  timelineRailCol: { alignItems: 'center', width: 36 },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineEmoji: { fontSize: 16 },
  timelineRail: {
    width: 3,
    flex: 1,
    minHeight: 20,
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 2,
    opacity: 0.4,
  },
  timelineContent: { flex: 1, paddingBottom: 20 },
  timelineType: {
    fontSize: 11,
    fontWeight: '900',
    color: '#863ceb',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timelineDesc: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0d0d0d',
    marginTop: 2,
    lineHeight: 20,
  },
  timelineDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 4,
  },
});
