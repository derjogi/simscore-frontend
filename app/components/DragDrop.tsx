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
  originalIndex: number;
  currentIndex: number;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, content, similarity, distance, originalIndex, currentIndex }) => {
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
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-16 text-center">
          {originalIndex !== currentIndex ? (
            <>
              <span className="line-through">{originalIndex + 1}</span>
              <span className="text-red-500 ml-1">{currentIndex + 1}</span>
            </>
          ) : (
            <span>{originalIndex + 1}</span>
          )}
        </div>
        <div className="flex-grow">
          <span className="font-medium">{content}</span>
        </div>
        <div className="text-sm text-gray-500 text-right md:flex md:flex-col">
          <span className="mr-2 whitespace-nowrap md:mr-0">Similarity: {similarity.toFixed(2)}</span>
          <span className="whitespace-nowrap">Distance: {distance.toFixed(2)}</span>
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
      originalIndex: index,
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
          {items.map((item, index) => (
            <SortableItem 
              key={item.id} 
              id={item.id} 
              content={item.content} 
              similarity={item.similarity} 
              distance={item.distance} 
              originalIndex={item.originalIndex}
              currentIndex={index}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

export default DragDrop;