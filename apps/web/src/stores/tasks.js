import { makeObservable, observable, action, computed, runInAction } from 'mobx';
import { api } from '../api';
import dayjs from 'dayjs';

class TasksStore {
  tasks = [];
  loading = false;
  error = null;
  mode = 'deadline';

  constructor() {
    makeObservable(this, {
      tasks: observable.shallow,
      loading: observable,
      error: observable.ref,
      mode: observable,

      setTasks: action.bound,
      setLoading: action.bound,
      setError: action.bound,
      setMode: action.bound,

      fetchAll: action.bound,
      create: action.bound,
      update: action.bound,
      updateStatus: action.bound,
      remove: action.bound,

      total: computed,
      doneCount: computed,
      overdueCount: computed,
      groupedByDeadline: computed,
      groupedByAssignee: computed,
    });
  }

  setTasks(list) { this.tasks = list; }
  setLoading(v) { this.loading = v; }
  setError(e) { this.error = e; }
  setMode(v) { this.mode = v; }

  get total() { return this.tasks.length; }
  get doneCount() { return this.tasks.filter(t => t.status === 'DONE').length; }
  get overdueCount() {
    const now = dayjs();
    return this.tasks.filter(t => t.status !== 'DONE' && dayjs(t.due_date || t.dueDate).isBefore(now, 'day')).length;
  }

  get groupedByDeadline() {
    const res = { 'Сегодня': [], 'На неделю': [], 'Будущее': [] };
    const today = dayjs().startOf('day');
    const weekEnd = today.add(7, 'day').endOf('day');
    (this.tasks || []).forEach(t => {
      const due = dayjs(t.due_date || t.dueDate);
      if (!due.isValid()) res['Будущее'].push(t);
      else if (due.isSame(today, 'day')) res['Сегодня'].push(t);
      else if (due.isAfter(today, 'day') && due.isBefore(weekEnd)) res['На неделю'].push(t);
      else res['Будущее'].push(t);
    });
    return res;
  }

  get groupedByAssignee() {
    const groups = {};
    (this.tasks || []).forEach(t => {
      const a = t.assignee || t.user_assignee || {};
      const key = a.id ?? 'Без ответственного';
      const label = a.id
        ? `${a.lastName || a.last_name || ''} ${a.firstName || a.first_name || ''}`.trim() || a.login || `пользователь #${a.id}`
        : 'Без ответственного';
      if (!groups[key]) groups[key] = { label, items: [] };
      groups[key].items.push(t);
    });
    return groups;
  }

  async fetchAll() {
    this.setLoading(true);
    this.setError(null);
    try {
      const res = await api.get('/tasks');
      runInAction(() => this.tasks = res.data);
    } catch (e) {
      runInAction(() => this.error = e?.response?.data?.error || 'LOAD_FAILED');
    } finally {
      runInAction(() => this.loading = false);
    }
  }

  async create(dto) {
    this.setError(null);
    try {
      const res = await api.post('/tasks', dto);
      runInAction(() => this.tasks.unshift(res.data));
      return true;
    } catch (e) {
      runInAction(() => this.error = e?.response?.data?.error || 'CREATE_FAILED');
      return false;
    }
  }

  async update(id, patch) {
    this.setError(null);
    try {
      const res = await api.patch(`/tasks/${id}`, patch);
      runInAction(() => {
        const i = this.tasks.findIndex(t => t.id === id);
        if (i !== -1) this.tasks[i] = res.data;
      });
      return true;
    } catch (e) {
      runInAction(() => this.error = e?.response?.data?.error || 'UPDATE_FAILED');
      return false;
    }
  }

  async updateStatus(id, status) {
    this.setError(null);
    try {
      const res = await api.patch(`/tasks/${id}/status`, { status });
      runInAction(() => {
        const i = this.tasks.findIndex(t => t.id === id);
        if (i !== -1) this.tasks[i] = res.data;
      });
      return true;
    } catch (e) {
      runInAction(() => this.error = e?.response?.data?.error || 'STATUS_FAILED');
      return false;
    }
  }

  async remove(id) {
    this.setError(null);
    try {
      await api.delete(`/tasks/${id}`);
      runInAction(() => {
        this.tasks = this.tasks.filter(t => t.id !== id);
      });
      return true;
    } catch (e) {
      runInAction(() => this.error = e?.response?.data?.error || 'DELETE_FAILED');
      return false;
    }
  }

  titleColor(t) {
    if (t.status === 'DONE') return 'green';
    if (dayjs(t.due_date || t.dueDate).isBefore(dayjs(), 'day')) return 'red';
    return 'gray';
  }
}

export const tasksStore = new TasksStore();
