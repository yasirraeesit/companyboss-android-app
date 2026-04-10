import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

const API_BASE = 'http://192.168.1.11:5000/api/documents';

const CATEGORY_ICONS = {
  Handbook: { icon: 'book', color: '#863ceb', bg: '#f5f3ff' },
  Policy: { icon: 'document-text', color: '#f6d140', bg: '#fefce8' },
  Legal: { icon: 'shield-checkmark', color: '#ef4444', bg: '#fee2e2' },
  Personal: { icon: 'person', color: '#3b82f6', bg: '#eff6ff' },
};

export default function Vault() {
  const router = useRouter();
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocs = async () => {
    try {
      const id = user?._id || user?.id;
      const res = await fetch(`${API_BASE}?employeeId=${id}`);
      const json = await res.json();
      setDocs(json);
    } catch (err) {
      console.error('Vault fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDocs();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#863ceb" />
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
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>MY VAULT</Text>
          <Text style={styles.heroSub}>{docs.length} Digital Documents</Text>
        </View>
        <View style={styles.lockIcon}>
          <Ionicons name="lock-closed" size={20} color="#f6d140" />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#863ceb" />}
      >
        {/* Action Required Section */}
        {docs.filter(d => !d.isSigned).length > 0 && (
          <View style={styles.actionSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text style={styles.sectionTitle}>ACTION REQUIRED</Text>
            </View>
            {docs.filter(d => !d.isSigned).map(doc => (
              <DocumentCard key={doc._id} doc={doc} onPress={() => router.push(`/documents/${doc._id}`)} />
            ))}
          </View>
        )}

        {/* All Documents */}
        <View style={styles.sectionHeader}>
          <Ionicons name="folder-open" size={18} color="#863ceb" />
          <Text style={[styles.sectionTitle, { color: '#863ceb' }]}>ALL DOCUMENTS</Text>
        </View>
        {docs.length === 0 ? (
          <View style={styles.emptyState}>
             <Ionicons name="document-outline" size={48} color="#9ca3af" />
             <Text style={styles.emptyText}>NO DOCUMENTS FOUND</Text>
          </View>
        ) : (
          docs.map(doc => (
            <DocumentCard key={doc._id} doc={doc} onPress={() => router.push(`/documents/${doc._id}`)} />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function DocumentCard({ doc, onPress }) {
  const cfg = CATEGORY_ICONS[doc.category] || CATEGORY_ICONS.Policy;
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
        <Ionicons name={cfg.icon} size={24} color={cfg.color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.docTitle} numberOfLines={1}>{doc.title}</Text>
        <Text style={styles.docDesc} numberOfLines={1}>{doc.description || 'Company Policy'}</Text>
        <View style={styles.cardFooter}>
           <Text style={styles.docMeta}>{doc.category.toUpperCase()}</Text>
           {doc.isSigned && (
             <View style={styles.signedBadge}>
               <Ionicons name="checkmark-done-circle" size={12} color="#10b981" />
               <Text style={styles.signedText}>SIGNED</Text>
             </View>
           )}
        </View>
      </View>
      {!doc.isSigned && (
        <View style={styles.unreadDot} />
      )}
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f3' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: {
    paddingTop: 54, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: '#0d0d0d', borderBottomWidth: 4, borderColor: '#863ceb',
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  backButton: {
    width: 44, height: 44, backgroundColor: '#fff', borderWidth: 2,
    borderColor: '#863ceb', borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#863ceb', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#f6d140', letterSpacing: -0.5 },
  heroSub: { fontSize: 12, fontWeight: '700', color: '#9ca3af', marginTop: 2 },
  lockIcon: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20 },
  actionSection: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#ef4444', letterSpacing: 1.5 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 3, borderColor: '#0d0d0d',
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  iconBox: { width: 50, height: 50, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1 },
  docTitle: { fontSize: 16, fontWeight: '900', color: '#0d0d0d', marginBottom: 2 },
  docDesc: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 6 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  docMeta: { fontSize: 9, fontWeight: '800', color: '#9ca3af', letterSpacing: 0.5 },
  signedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#10b981' },
  signedText: { fontSize: 8, fontWeight: '900', color: '#10b981' },
  unreadDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4, borderWidth: 1, borderColor: '#fff' },
  emptyState: { paddingVertical: 50, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 13, fontWeight: '900', color: '#9ca3af', letterSpacing: 1 },
});
