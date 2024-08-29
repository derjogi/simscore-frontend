import React from 'react';
import { EvaluatedIdea } from '../constants';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


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

const ClusteredList: React.FC<ClusteredListProps> = ({ ideas, summaries }) => {
  let currentCluster: number | null = null;

  return (
    <ul className='space-y-2'>
      {ideas.map((idea, index) => {
        const elements = [];
        if (idea.cluster !== currentCluster) {
          currentCluster = idea.cluster;
          elements.push(
            <li
                key={`summary-${currentCluster}`}
                id={`item-summary-${index}`}>
              <strong>{summaries[currentCluster]}</strong>
            </li>

          );
        }
        elements.push(
          <SortableItem
            key={`idea-${index}`}
            id={`item-${index}`}
            idea={idea}
            originalIndex={index}
            currentIndex={index}
          />
        );
        return elements;
      })}
    </ul>
  );
};

export default ClusteredList;