import React from 'react';
import DndProvider from '@/providers/DndProvider';
import Item from './Item';
import { EvaluatedIdeaWithId } from '../constants';
import { arrayMove } from '@dnd-kit/sortable';


function Category({ category, ideas, sessionId }: { category: string, ideas: EvaluatedIdeaWithId[], sessionId: string }) {
  const [items, setItems] = React.useState(ideas);
  
  const onDragEnd = React.useCallback((event: any) => {
    console.log("Drag End Event: ", event);
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);
        return arrayMove(currentItems, oldIndex, newIndex)
      });
    }
  }, []);

  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <h2 className="text-xl font-semibold bg-gray-100 p-4 border-b">{category}</h2>
      <div className="p-4 space-y-4">
        <DndProvider dndItems={items} onDragEnd={onDragEnd}>
          {items.map((idea) => (
            <Item key={idea.id} idea={idea} sessionId={sessionId}/>
          ))}
        </DndProvider>
      </div>
    </div>
  );
}

export default Category;