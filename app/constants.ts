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

export interface KmeansCluster {
  data: number[][];
  centers: number[][];
}

export interface KmeansData {
  [clusterNumber: number]: KmeansCluster;
}