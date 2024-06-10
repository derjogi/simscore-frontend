export interface OutputItem {
    idea: string;
    similarity: number;
  }
  
export interface PlotData {
  scatter_points: [[number, number]];
  marker_sizes: [[number]];
  ideas: [string];
  pairwise_similarity: [[number]];
}