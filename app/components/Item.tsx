import React from 'react';
import StarRating from './StarRating';
import { EvaluatedIdeaWithId } from '../constants';
import { useDraggable } from '@/hooks/useDraggable';

function Item({ idea }: { idea: EvaluatedIdeaWithId }) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable(idea.id);

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      {...listeners} 
      {...attributes}
      className="bg-gray-50 rounded-md p-4 hover:bg-gray-100 transition-colors duration-200 cursor-move"
    >
      <h3 className="text-lg font-medium mb-2">{idea.idea}</h3>
      <p className="text-sm text-gray-600 mb-2">Distance: {idea.distance.toFixed(2)}</p>
      <StarRating 
        userRating={0} 
        averageRating={4.3} 
        itemId={`${idea.cluster}_${idea.distance}`} 
      />
    </div>
  );
}

export default Item;
