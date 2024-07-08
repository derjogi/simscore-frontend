import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IdeasAndSimScores } from '../constants';

interface DragDropProps {
  data: IdeasAndSimScores;
}

interface SortableItemProps {
  id: string;
  content: string;
  similarity: number;
  distance: number;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, content, similarity, distance }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white p-4 rounded shadow mb-2 cursor-move">
      <div className="flex justify-between items-center">
        <span className="font-medium">{content}</span>
        <div className="text-sm text-gray-500">
          <span className="mr-2">Similarity: {similarity.toFixed(2)}</span>
          <span>Distance: {distance.toFixed(2)}</span>
        </div>
      </div>
    </li>
  );
};

const DragDrop: React.FC<DragDropProps> = ({ data }) => {
  const [items, setItems] = useState(
    data.ideas.map((idea, index) => ({
      id: `item-${index}`,
      content: idea,
      similarity: data.similarity[index],
      distance: data.distance[index],
    }))
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id} content={item.content} similarity={item.similarity} distance={item.distance} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

export default DragDrop;