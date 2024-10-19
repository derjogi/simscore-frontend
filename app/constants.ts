import { User } from "next-auth";

export interface IdeasAndSimScores {
  ideas: string[];
  similarity: number[];
  distance: number[];
}

export interface ItemWithId {
  id: number;
}

export type EvaluatedIdeaWithId = EvaluatedIdea & ItemWithId
  
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

export interface Ratings {
  userRatings: {
    userId: string;
    rating: number;
  }[];
}

export interface EvaluatedIdea {
  id?: string
  idea: string;
  similarity: number;
  distance: number;
  cluster: number;
  ratings: Ratings;
}

