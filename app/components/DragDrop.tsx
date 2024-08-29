import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { EvaluatedIdea } from '../constants';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DragDropProps {
  data: EvaluatedIdea[];
  summaries: string[];
  onUpdate: (updatedData: string[]) => void;
}

interface ClusteredListProps {
  ideas: EvaluatedIdea[];
  summaries: Record<number, string>;
}


interface SortableItemProps {
  id: string;
  idea?: EvaluatedIdea;
  summary?: string;
  originalIndex: number;
  currentIndex: number;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, idea, summary, originalIndex, currentIndex }) => {
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
          <span className="font-medium">{idea?.idea || summary}</span>
        </div>
        {idea && (
          <div className="text-sm text-gray-500 text-right md:flex md:flex-col">
            <span className="mr-2 whitespace-nowrap md:mr-0">Similarity: {idea.similarity.toFixed(2)}</span>
            <span className="whitespace-nowrap">Distance: {idea.distance.toFixed(2)}</span>
          </div>
        )}
      </div>
    </li>
  );
};

const DragDrop: React.FC<DragDropProps> = ({ data, summaries, onUpdate }) => {
  // Initial creation of items. Sort them by their cluster, so that we have #clusters blocks of ideas.
  const [items, setItems] = useState(
    data
      .sort((a, b) => a.cluster - b.cluster)
      .map((idea, index) => ({
        id: `item-${index}`,
        idea: idea,
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
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      const updatedIdeas = newItems.map(item => item.idea.idea);
      onUpdate(updatedIdeas);
    }
  };


  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <ul className='space-y-2'>
          {
            createSortableListElement(items, summaries)
          }
        </ul>
      </SortableContext>
    </DndContext>
  );
};

export default DragDrop;

function createSortableListElement(
  items: {
    id: string;
    idea: {
      idea: string;
      similarity: number;
      distance: number;
      cluster: number;
    };
    originalIndex: number;
  }[],
  summaries: string[]): React.ReactNode {
  let currentCluster: number | null = null;
  return items.map((item, index) => {
    const elements = [];
    if (item.idea.cluster !== currentCluster) {
      currentCluster = item.idea.cluster;
      elements.push(
        <li
          key={`summary-${currentCluster}`}
          id={`item-summary-${index}`}>
          {summaries[currentCluster] ? (
            <strong>{summaries[currentCluster]}</strong>
          ) : (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
            </div>
          )}
        </li>
      );
    }
    elements.push(
      <SortableItem
        key={`idea-${index}`}
        id={`item-${index}`}
        idea={item.idea}
        originalIndex={index}
        currentIndex={index} />
    );
    return elements;
  });
}
