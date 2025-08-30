import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { api } from '../api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authStore } from '../stores/auth';

const Statuses = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELED'];
const Priorities = ['HIGH', 'MEDIUM', 'LOW'];

const schemaCreate = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().min(1),
  priority: z.enum(Priorities),
  assigneeId: z.coerce.number().int()
});

export default function TaskModal({ task, onClose }) {
  const qc = useQueryClient();
  const me = authStore.user;

  const { data: subs = [] } = useQuery({
    queryKey: ['subs'],
    queryFn: async () => (await api.get('/users/subordinates')).data,
    enabled: !task
  });

  const canEditAttrs = useMemo(() => {
    if (!task) return true;
    if (me?.managerId && task.creator?.id === me.managerId) return false;
    if (task.creator?.id === me?.id) return true;
    return false;
  }, [task, me]);

  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(schemaCreate),
    values: task ? {
      title: task.title,
      description: task.description,
      dueDate: dayjs(task.due_date || task.dueDate).format('YYYY-MM-DD'),
      priority: task.priority,
      assigneeId: task.assignee?.id
    } : {
      title: '',
      description: '',
      dueDate: dayjs().format('YYYY-MM-DD'),
      priority: 'MEDIUM',
      assigneeId: subs[0]?.id
    }
  });

  useEffect(() => {
    if (!task && subs.length) {
      reset(v => ({ ...v, assigneeId: subs[0].id }));
    }
  }, [subs, task, reset]);

  const onSave = handleSubmit(async (dto) => {
    if (task) {
      if (canEditAttrs) {
        await api.patch(`/tasks/${task.id}`, dto);
      } else {
        alert('Эту задачу можно менять только по статусу (создана руководителем).');
        return;
      }
    } else {
      await api.post('/tasks', dto);
    }
    await qc.invalidateQueries({ queryKey: ['tasks'] });
    onClose();
  });

  const onStatusChange = async (status) => {
    if (!task) return;
    await api.patch(`/tasks/${task.id}/status`, { status });
    await qc.invalidateQueries({ queryKey: ['tasks'] });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{task ? 'Задача' : 'Новая задача'}</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <label className="label">Заголовок <input className="input" disabled={!canEditAttrs} {...register('title')} /></label>
          <label className="label">Описание <textarea className="textarea" disabled={!canEditAttrs} {...register('description')} /></label>
          <label className="label">Срок <input className="input" type="date" disabled={!canEditAttrs} {...register('dueDate')} /></label>
          <label className="label">Приоритет
            <select className="select" disabled={!canEditAttrs} {...register('priority')}>
              {Priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="label">Ответственный
            {task ? (
              <input className="input" disabled value={`${task.assignee?.lastName} ${task.assignee?.firstName}`} />
            ) : (
              <select className="select" {...register('assigneeId')}>
                {subs.map(s => <option key={s.id} value={s.id}>{s.last_name || s.lastName} {s.first_name || s.firstName}</option>)}
              </select>
            )}
          </label>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            {task && (
              <select className="select" defaultValue={task.status} onChange={(e) => onStatusChange(e.target.value)}>
                {Statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            <button className="btn" onClick={onClose}>Отмена</button>
            <button className="btn primary" onClick={onSave}>{task ? 'Сохранить' : 'Создать'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
