import React from 'react';
import dayjs from 'dayjs';
import cx from 'classnames';

export default function TaskCard({ task, titleColor, onClick }) {
    const t = task;
    const due = dayjs(t.due_date || t.dueDate);
    const dueText = due.isValid() ? due.format('DD.MM.YYYY') : '—'
    const assignee = t.assignee || t.user_assignee;
    const assigneeName =
        (assignee?.lastName || assignee?.last_name || '') &&
            (assignee?.firstName || assignee?.first_name || '')
            ? `${assignee.lastName || assignee.last_name} ${assignee.firstName || assignee.first_name}`
            : (assignee?.login || '—');

    return (
        <div className="card clickable" onClick={() => onClick?.(t)} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.(t)}>
            <div className={cx('task-title', {
                green: t.status === 'DONE',
                red: t.status !== 'DONE' && dayjs(t.due_date || t.dueDate).isBefore(dayjs(), 'day'),
                gray: !(t.status === 'DONE') && !dayjs(t.due_date || t.dueDate).isBefore(dayjs(), 'day')
            })}>
                {t.title}
            </div>
            <div className="meta">
                <span>Приоритет: {t.priority}</span>
                <span>Срок: {dueText}</span>
                <span>Ответственный: {assigneeName}</span>
                <span>Статус: {t.status}</span>
            </div>
        </div>
    );
}
