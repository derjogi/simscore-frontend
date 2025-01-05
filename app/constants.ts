import { User } from "next-auth";

export interface IdeasAndSimScores {
  ideas: string[];
  similarity: number[];
  distance: number[];
}

export interface ItemWithId {
  id: string;
}

export type EvaluatedIdeaWithId = EvaluatedIdea & ItemWithId
  
// export interface PlotData {
//   scatter_points: [[number, number]];
//   marker_sizes: [[number]];
//   ideas: [string];
//   pairwise_similarity: [[number]];
//   kmeans_data?: KmeansData;
// }

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
  id: string | number
  author_id?: string
  idea: string;
  similarity_score: number;
  cluster_id: number;
}

interface GraphNode {
  id: string | number
  coordinates: {
    x: number,
    y: number
  }
}

interface GraphEdge {
    from_id: number
    to_id: number
    similarity: number
}

export interface RelationshipGraph {
    nodes: GraphNode[]
    edges: GraphEdge[]
}

export interface AnalysisResponse {
    ranked_ideas: EvaluatedIdea[]
    relationship_graph?: RelationshipGraph
    pairwise_similarity_matrix?: number[][]
}