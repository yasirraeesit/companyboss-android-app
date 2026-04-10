import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

const API_BASE = 'http://192.168.1.11:5000/api/tasks';

const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f6d140',
  Low: '#10b981',
};

export default function Tasks() {
  const router = useRouter();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  const fetchTasks = async () => {
    try {
      const id = user?._id || user?.id;
      const res = await fetch(`${API_BASE}?assigneeId=${id}`);
      const json = await res.json();
      setTasks(json);
    } catch (err) {
      console.error('Task fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await fetch(`${API_BASE}/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Update status error:', err);
      fetchTasks();
    }
  };

  const filteredTasks = tasks.filter(t => filter === 'All' || t.status === filter);

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
          <Text style={styles.heroTitle}>PROJECT BOARD</Text>
          <Text style={styles.heroSub}>{tasks.filter(t => t.status !== 'Done').length} Pending Tasks</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/standup')} style={styles.standupBtn}>
           <Ionicons name="megaphone" size={20} color="#fff" />
           <Text style={styles.standupBtnText}>DAILY</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {['All', 'Todo', 'In Progress', 'Done'].map(f => (
          <TouchableOpacity 
            key={f} 
            style={[styles.filterTab, filter === f && styles.activeFilter]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>{f.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#863ceb" />}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
             <Ionicons name="list-outline" size={48} color="#9ca3af" />
             <Text style={styles.emptyText}>NO TASKS FOUND</Text>
          </View>
        ) : (
          filteredTasks.map(task => (
            <TaskCard key={task._id} task={task} onStatusUpdate={updateStatus} />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function TaskCard({ task, onStatusUpdate }) {
  const isDone = task.status === 'Done';
  
  return (
    <View style={[styles.card, isDone && styles.doneCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleArea}>
           <Text style={[styles.projectLabel, { color: PRIORITY_COLORS[task.priority] }]}>{task.projectName.toUpperCase()}</Text>
           <Text style={[styles.taskTitle, isDone && styles.strikeText]}>{task.title}</Text>
        </View>
        <View style={[styles.priorityBadge, { borderColor: PRIORITY_COLORS[task.priority] }]}>
          <Text style={[styles.priorityText, { color: PRIORITY_COLORS[task.priority] }]}>{task.priority}</Text>
        </View>
      </View>
      
      <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
      
      <View style={styles.cardFooter}>
        <View style={styles.metaRow}>
           <Ionicons name="calendar-outline" size={14} color="#6b7280" />
           <Text style={styles.metaText}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'NO DEADLINE'}</Text>
        </View>
        <View style={styles.actionRow}>
           {task.status === 'Todo' ? (
             <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#863ceb' }]} onPress={() => onStatusUpdate(task._id, 'In Progress')}>
                <Text style={styles.statusBtnText}>START</Text>
             </TouchableOpacity>
           ) : task.status === 'In Progress' ? (
             <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#10b981' }]} onPress={() => onStatusUpdate(task._id, 'Done')}>
                <Text style={styles.statusBtnText}>COMPLETE</Text>
             </TouchableOpacity>
           ) : (
             <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#f3f4f6', borderColor: '#d1d5db', borderWidth: 1 }]} onPress={() => onStatusUpdate(task._id, 'In Progress')}>
                <Text style={[styles.statusBtnText, { color: '#6b7280' }]}>REOPEN</Text>
             </TouchableOpacity>
           )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f3' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: {
    paddingTop: 54, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: '#fff', borderBottomWidth: 4, borderColor: '#0d0d0d',
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  backButton: {
    width: 44, height: 44, backgroundColor: '#f3f4f6', borderWidth: 2,
    borderColor: '#0d0d0d', borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#0d0d0d', letterSpacing: -0.5 },
  heroSub: { fontSize: 12, fontWeight: '700', color: '#6b7280', marginTop: 2 },
  standupBtn: { backgroundColor: '#863ceb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 2, borderColor: '#0d0d0d' },
  standupBtnText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  filterBar: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderBottomWidth: 2, borderColor: '#f3f4f6', gap: 8 },
  filterTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderSize: 1, borderColor: '#e5e7eb' },
  activeFilter: { backgroundColor: '#0d0d0d' },
  filterText: { fontSize: 10, fontWeight: '800', color: '#6b7280' },
  activeFilterText: { color: '#fff' },
  scroll: { padding: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 3, borderColor: '#0d0d0d',
    padding: 18, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  doneCard: { backgroundColor: '#f9fafb', opacity: 0.8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  titleArea: { flex: 1 },
  projectLabel: { fontSize: 10, fontWeight: '900', marginBottom: 4 },
  taskTitle: { fontSize: 18, fontWeight: '900', color: '#0d0d0d', lineHeight: 22 },
  strikeText: { textDecorationLine: 'line-through' },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1.5 },
  priorityText: { fontSize: 8, fontWeight: '900' },
  taskDesc: { fontSize: 13, fontWeight: '600', color: '#4b5563', marginBottom: 18, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1.5, borderTopColor: '#f3f4f6', paddingTop: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 11, fontWeight: '800', color: '#6b7280' },
  actionRow: { flexDirection: 'row', gap: 8 },
  statusBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 2, borderColor: '#0d0d0d' },
  statusBtnText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  emptyState: { paddingVertical: 60, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 13, fontWeight: '900', color: '#9ca3af' },
});
