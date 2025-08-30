import React from 'react';
import TaskCard from './TaskCard';

export default function TaskList({ items, titleColor, onItemClick }) {
  return (
    <div className="cards">
      {(items || []).map(t => (
        <TaskCard key={t.id} task={t} titleColor={titleColor} onClick={onItemClick}/>
      ))}
    </div>
  );
}
