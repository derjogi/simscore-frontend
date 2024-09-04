import React, { useEffect, useState } from 'react';
import Category from './Category';
import { EvaluatedIdea } from '../constants';

interface ClusterViewProps {
  data: EvaluatedIdea[];
  clusterTitles: string[];
}

const  ClusterView: React.FC<ClusterViewProps> = ({ data, clusterTitles: clusters}) =>  {
  console.log("Summaries: ", clusters);
  const ideasWithIDs = data.map((idea, index) => ({ ...idea, id: index }));
  console.log("Ideas with IDs: ", ideasWithIDs);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clusters.map((category, index) => (
          <Category 
            key={index} 
            category={category} 
            ideas={ideasWithIDs.filter(idea => idea.cluster === index)} 
          />
        ))}
      </div>
    </div>
  );
}

export default ClusterView;