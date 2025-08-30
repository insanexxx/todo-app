import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { tasksStore } from '../stores/tasks';
import TaskList from '../components/TaskList';
import TaskModal from '../components/TaskModal';

export default observer(function Tasks() {
  const { tasks, loading, error, mode, setMode, fetchAll, titleColor, groupedByDeadline, groupedByAssignee } = tasksStore;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openNew = () => { setSelected(null); setOpen(true); };
  const openTask = (t) => { setSelected(t); setOpen(true); };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <div className="toolbar" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <button className={`btn ${mode === 'deadline' ? 'primary' : ''}`} onClick={() => setMode('deadline')}>По срокам</button>
        <button className={`btn ${mode === 'assignee' ? 'primary' : ''}`} onClick={() => setMode('assignee')}>По ответственным</button>
        <button className={`btn ${mode === 'none' ? 'primary' : ''}`} onClick={() => setMode('none')}>Без группировки</button>
        <div style={{ flex: 1 }} />
        <button className="btn primary" onClick={openNew}>Новая задача</button>
      </div>

      {loading && <div className="card">Загрузка…</div>}
      {error && <div className="card" style={{ color: 'crimson' }}>Ошибка: {String(error)}</div>}

      {!loading && !error && (
        <>
          {mode === 'deadline' &&
            Object.entries(groupedByDeadline || {}).map(([group, list]) => (
              <section key={group} style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '8px 0' }}>{group}</h3>
                <TaskList items={list} titleColor={titleColor} onItemClick={openTask} />
              </section>
            ))
          }

          {mode === 'assignee' &&
            Object.entries(groupedByAssignee || {}).map(([key, val]) => (
              <section key={key} style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '8px 0' }}>{val.label}</h3>
                <TaskList items={val.items || []} titleColor={titleColor} onItemClick={openTask} />
              </section>
            ))
          }

          {mode === 'none' && <TaskList items={tasks || []} titleColor={titleColor} onItemClick={openTask} />}
        </>
      )}

      {open && <TaskModal open={open} onClose={closeModal} task={selected} />}
    </div>
  );
});
