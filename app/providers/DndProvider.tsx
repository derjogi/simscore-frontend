import React from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ItemWithId } from '../constants';

interface DndProviderProps {
  dndItems: ItemWithId[];
  onDragEnd: (event: DragEndEvent) => void;
  children: React.ReactNode;
}

export const DndProvider: React.FC<DndProviderProps> = ({ dndItems: dndItems, onDragEnd, children }) => {
  console.log("DndItems: ", dndItems);
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={dndItems} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
};

export default DndProvider;
