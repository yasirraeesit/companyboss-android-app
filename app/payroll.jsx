import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

const API_BASE = 'http://192.168.1.11:5000/api/payroll';

const fmt = (n) => `$${Number(n).toLocaleString('en-US')}`;

export default function Payroll() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const id = user?.id || user?._id;
        const res = await fetch(`${API_BASE}/${id}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Payroll fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#863ceb" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loader}>
        <Ionicons name="alert-circle-outline" size={48} color="#9ca3af" />
        <Text style={styles.errorText}>COULD NOT LOAD PAYROLL</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const slip = data.history[selectedIndex];
  const deductPct = Math.round((slip.deductions / slip.baseSalary) * 100);
  const bonusPct = Math.round((slip.bonus / slip.baseSalary) * 100);

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#0d0d0d" />
        </TouchableOpacity>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>MY PAY SLIP</Text>
          <Text style={styles.heroSub}>{data.employee.name} • {data.employee.department}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Month Selector */}
        <View style={styles.monthRow}>
          {data.history.map((h, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.monthChip, i === selectedIndex && styles.monthChipActive]}
              onPress={() => setSelectedIndex(i)}
              activeOpacity={0.8}
            >
              <Text style={[styles.monthChipText, i === selectedIndex && styles.monthChipTextActive]}>
                {h.month.substring(0, 3).toUpperCase()}
              </Text>
              <Text style={[styles.monthChipYear, i === selectedIndex && styles.monthChipTextActive]}>
                {h.year}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBanner, { backgroundColor: slip.status === 'Paid' ? '#dcfce7' : '#fef9c3' }]}>
          <Ionicons
            name={slip.status === 'Paid' ? 'checkmark-circle' : 'time'}
            size={18}
            color={slip.status === 'Paid' ? '#16a34a' : '#d97706'}
          />
          <Text style={[styles.statusText, { color: slip.status === 'Paid' ? '#16a34a' : '#d97706' }]}>
            {slip.status === 'Paid' ? `${slip.month} ${slip.year} — PAID` : `${slip.month} ${slip.year} — PROCESSING`}
          </Text>
        </View>

        {/* Net Pay Hero Card */}
        <View style={styles.netPayCard}>
          <Text style={styles.netPayLabel}>NET PAY</Text>
          <Text style={styles.netPayAmount}>{fmt(slip.netPay)}</Text>
          <Text style={styles.netPaySub}>After deductions & bonus</Text>
        </View>

        {/* Breakdown */}
        <Text style={styles.sectionTitle}>BREAKDOWN</Text>
        <View style={styles.breakdownCard}>
          <BreakdownRow
            label="Base Salary"
            value={fmt(slip.baseSalary)}
            icon="cash-outline"
            color="#863ceb"
            positive
          />
          <View style={styles.divider} />
          <BreakdownRow
            label={`Deductions (${deductPct}%)`}
            value={`-${fmt(slip.deductions)}`}
            icon="remove-circle-outline"
            color="#ef4444"
          />
          <View style={styles.divider} />
          <BreakdownRow
            label={`Performance Bonus (${bonusPct}%)`}
            value={`+${fmt(slip.bonus)}`}
            icon="trending-up-outline"
            color="#10b981"
            positive
          />
          <View style={[styles.divider, { borderColor: '#863ceb' }]} />
          <BreakdownRow
            label="Net Pay"
            value={fmt(slip.netPay)}
            icon="wallet-outline"
            color="#863ceb"
            bold
            positive
          />
        </View>

        {/* Visual Bar */}
        <Text style={styles.sectionTitle}>SALARY COMPOSITION</Text>
        <View style={styles.barCard}>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Base</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '100%', backgroundColor: '#863ceb' }]} />
            </View>
            <Text style={styles.barValue}>{fmt(slip.baseSalary)}</Text>
          </View>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Deduct</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${deductPct}%`, backgroundColor: '#ef4444' }]} />
            </View>
            <Text style={styles.barValue}>-{fmt(slip.deductions)}</Text>
          </View>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Bonus</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${bonusPct}%`, backgroundColor: '#10b981' }]} />
            </View>
            <Text style={styles.barValue}>+{fmt(slip.bonus)}</Text>
          </View>
        </View>

        {/* Leave Balances */}
        {data.leaveBalances && (
          <>
            <Text style={styles.sectionTitle}>LEAVE BALANCES</Text>
            <View style={styles.leaveRow}>
              {[
                { label: 'ANNUAL', val: data.leaveBalances.annual ?? 20, color: '#863ceb' },
                { label: 'SICK', val: data.leaveBalances.sick ?? 10, color: '#f6d140' },
                { label: 'CASUAL', val: data.leaveBalances.casual ?? 5, color: '#10b981' },
              ].map(item => (
                <View key={item.label} style={[styles.leaveBox, { borderColor: item.color }]}>
                  <Text style={[styles.leaveVal, { color: item.color }]}>{item.val}</Text>
                  <Text style={styles.leaveLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

function BreakdownRow({ label, value, icon, color, bold, positive }) {
  return (
    <View style={bStyles.row}>
      <View style={[bStyles.iconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[bStyles.label, bold && bStyles.bold]}>{label}</Text>
      <Text style={[bStyles.value, { color }, bold && bStyles.bold]}>{value}</Text>
    </View>
  );
}

const bStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  iconBox: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  label: { flex: 1, fontSize: 14, fontWeight: '700', color: '#0d0d0d' },
  value: { fontSize: 15, fontWeight: '800' },
  bold: { fontWeight: '900', fontSize: 16 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f3' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  errorText: { fontSize: 14, fontWeight: '900', color: '#0d0d0d', letterSpacing: 1 },
  backBtn: {
    backgroundColor: '#863ceb', paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 8, borderWidth: 2.5, borderColor: '#0d0d0d',
  },
  backBtnText: { color: '#fff', fontWeight: '900' },
  hero: {
    paddingTop: 54, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: '#0d0d0d', borderBottomWidth: 4, borderColor: '#863ceb',
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  backButton: {
    width: 42, height: 42, backgroundColor: '#fff', borderWidth: 2.5,
    borderColor: '#863ceb', borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#863ceb', shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#f6d140', letterSpacing: -0.5 },
  heroSub: { fontSize: 12, fontWeight: '700', color: '#9ca3af', marginTop: 2 },
  scroll: { padding: 20 },
  monthRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  monthChip: {
    flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 2.5,
    borderColor: '#0d0d0d', backgroundColor: '#fff', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  monthChipActive: { backgroundColor: '#863ceb', borderColor: '#863ceb' },
  monthChipText: { fontSize: 13, fontWeight: '900', color: '#0d0d0d', textTransform: 'uppercase' },
  monthChipYear: { fontSize: 10, fontWeight: '700', color: '#6b7280', marginTop: 2 },
  monthChipTextActive: { color: '#fff' },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14,
    borderRadius: 10, borderWidth: 2.5, borderColor: '#0d0d0d',
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  statusText: { fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  netPayCard: {
    backgroundColor: '#863ceb', borderRadius: 16, borderWidth: 3,
    borderColor: '#0d0d0d', padding: 28, alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 6,
  },
  netPayLabel: { fontSize: 11, fontWeight: '900', color: '#f6d140', letterSpacing: 2, textTransform: 'uppercase' },
  netPayAmount: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: -2, marginTop: 6 },
  netPaySub: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  sectionTitle: {
    fontSize: 12, fontWeight: '900', color: '#0d0d0d',
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12,
  },
  breakdownCard: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 3,
    borderColor: '#0d0d0d', padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  divider: { height: 1.5, backgroundColor: '#f3f4f6', marginVertical: 12 },
  barCard: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 3,
    borderColor: '#0d0d0d', padding: 20, marginBottom: 24, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  barLabel: { width: 44, fontSize: 10, fontWeight: '900', color: '#6b7280', textTransform: 'uppercase' },
  barTrack: {
    flex: 1, height: 12, backgroundColor: '#f3f4f6',
    borderRadius: 6, borderWidth: 1.5, borderColor: '#0d0d0d', overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },
  barValue: { width: 70, fontSize: 12, fontWeight: '800', color: '#0d0d0d', textAlign: 'right' },
  leaveRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  leaveBox: {
    flex: 1, backgroundColor: '#fff', borderWidth: 3, borderRadius: 12,
    paddingVertical: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  leaveVal: { fontSize: 32, fontWeight: '900' },
  leaveLabel: { fontSize: 9, fontWeight: '900', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
});
