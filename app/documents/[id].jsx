import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';

const API_BASE = 'http://192.168.1.11:5000/api/documents';

export default function DocumentDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  const fetchDoc = async () => {
    try {
      const empId = user?._id || user?.id;
      const res = await fetch(`${API_BASE}?employeeId=${empId}`);
      const json = await res.json();
      const document = json.find(d => d._id === id);
      setDoc(document);
    } catch (err) {
      console.error('Doc detail fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoc(); }, [id]);

  const handleSignOff = async () => {
    try {
      setSigning(true);
      const res = await fetch(`${API_BASE}/${id}/sign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: user?._id || user?.id }),
      });
      
      if (res.ok) {
        Alert.alert('Success', 'Policy acknowledged successfully!');
        fetchDoc();
      } else {
        throw new Error('Sign-off failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to process sign-off');
    } finally {
      setSigning(false);
    }
  };

  const openDocument = () => {
    if (doc?.fileUrl) {
      Linking.openURL(doc.fileUrl).catch(() => {
        Alert.alert('Error', 'Could not open document URL');
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#863ceb" />
      </View>
    );
  }

  if (!doc) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Document not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hero Header */}
      <View style={styles.hero}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0d0d0d" />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Policy Detail</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.docInfoCard}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{doc.category.toUpperCase()}</Text>
          </View>
          <Text style={styles.title}>{doc.title}</Text>
          <Text style={styles.description}>{doc.description || 'This is an important company document that requires your review and digital acknowledgment.'}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="#6b7280" />
              <Text style={styles.metaLabel}>PUBLISHED</Text>
              <Text style={styles.metaValue}>{new Date(doc.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color="#6b7280" />
              <Text style={styles.metaLabel}>SCOPE</Text>
              <Text style={styles.metaValue}>{doc.assignedTo}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.viewBtn} 
          activeOpacity={0.8}
          onPress={openDocument}
        >
          <Ionicons name="eye" size={20} color="#0d0d0d" />
          <Text style={styles.viewBtnText}>VIEW FULL DOCUMENT</Text>
        </TouchableOpacity>

        {doc.isSigned ? (
          <View style={styles.signedStatusCard}>
            <View style={styles.signedIconBox}>
              <Ionicons name="checkmark-seal" size={32} color="#10b981" />
            </View>
            <View>
              <Text style={styles.signedStatusTitle}>DIGITALLY ACKNOWLEDGED</Text>
              <Text style={styles.signedStatusSub}>Compliance active since {new Date(doc.signatures.find(s => s.employeeId.toString() === (user?._id || user?.id))?.signedAt).toLocaleString()}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.signActionCard}>
            <View style={styles.noticeIcon}>
              <Ionicons name="alert-circle" size={24} color="#f6d140" />
            </View>
            <Text style={styles.signTitle}>SIGN-OFF REQUIRED</Text>
            <Text style={styles.signBody}>By tapping the button below, you confirm that you have read and understood this document.</Text>
            <TouchableOpacity 
              style={styles.signBtn} 
              activeOpacity={0.9}
              onPress={handleSignOff}
              disabled={signing}
            >
              {signing ? <ActivityIndicator color="#fff" /> : <Text style={styles.signBtnText}>DIGITALLY SIGN</Text>}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f3' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, fontWeight: '900', color: '#0d0d0d', marginBottom: 20 },
  backBtn: { backgroundColor: '#863ceb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, borderWidth: 2, borderColor: '#0d0d0d' },
  backBtnText: { color: '#fff', fontWeight: '900' },
  hero: {
    paddingTop: 54, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: '#fff', borderBottomWidth: 4, borderColor: '#0d0d0d',
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  backButton: {
    width: 44, height: 44, backgroundColor: '#f3f4f6', borderWidth: 2,
    borderColor: '#0d0d0d', borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#0d0d0d', letterSpacing: -0.5 },
  scroll: { padding: 20 },
  docInfoCard: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 3, borderColor: '#0d0d0d',
    padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: '#863ceb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 12, borderWidth: 1.5, borderColor: '#0d0d0d' },
  categoryText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  title: { fontSize: 24, fontWeight: '900', color: '#0d0d0d', marginBottom: 12, lineHeight: 28 },
  description: { fontSize: 14, fontWeight: '600', color: '#4b5563', lineHeight: 22, marginBottom: 24 },
  metaRow: { flexDirection: 'row', gap: 24, borderTopWidth: 2, borderTopColor: '#f3f4f6', paddingTop: 20 },
  metaItem: { gap: 4 },
  metaLabel: { fontSize: 8, fontWeight: '900', color: '#9ca3af', letterSpacing: 1 },
  metaValue: { fontSize: 12, fontWeight: '800', color: '#0d0d0d' },
  viewBtn: {
    backgroundColor: '#f6d140', borderRadius: 12, borderWidth: 3, borderColor: '#0d0d0d',
    padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  viewBtnText: { fontSize: 14, fontWeight: '900', color: '#0d0d0d', letterSpacing: 0.5 },
  signedStatusCard: {
    backgroundColor: '#dcfce7', borderRadius: 12, borderWidth: 3, borderColor: '#10b981',
    padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderStyle: 'dashed',
  },
  signedStatusTitle: { fontSize: 13, fontWeight: '900', color: '#065f46' },
  signedStatusSub: { fontSize: 10, fontWeight: '700', color: '#059669', marginTop: 2 },
  signActionCard: {
    backgroundColor: '#0d0d0d', borderRadius: 16, borderWidth: 3, borderColor: '#0d0d0d',
    padding: 24, alignItems: 'center', shadowColor: '#f6d140', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  noticeIcon: { width: 48, height: 48, backgroundColor: 'rgba(246,209,64,0.1)', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  signTitle: { fontSize: 16, fontWeight: '900', color: '#f6d140', letterSpacing: 1, marginBottom: 8 },
  signBody: { fontSize: 12, fontWeight: '600', color: '#9ca3af', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  signBtn: {
    backgroundColor: '#863ceb', width: '100%', padding: 18, borderRadius: 10,
    alignItems: 'center', borderWidth: 2, borderColor: '#fff',
  },
  signBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
});
