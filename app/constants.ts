export interface IdeasAndSimScores {
  ideas: string[];
  similarity: number[];
  distance: number[];
}
  
export interface PlotData {
  scatter_points: [[number, number]];
  marker_sizes: [[number]];
  ideas: [string];
  pairwise_similarity: [[number]];
  kmeans_data?: KmeansData;
}

export interface KmeansData {
  data: number[][];
  centers: number[][];
  cluster: number[];
}

export interface EvaluatedIdea {
  idea: string;
  similarity: number;
  distance: number;
  cluster: number;
}

