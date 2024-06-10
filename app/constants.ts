export interface OutputItem {
  ideas: string[];
  similarity: number[];
  distance: number[];
}
  
export interface PlotData {
  scatter_points: [[number, number]];
  marker_sizes: [[number]];
  ideas: [string];
  pairwise_similarity: [[number]];
}