import numpy as np
import matplotlib.pyplot as plt, mpld3
from fastapi import FastAPI
from pydantic import BaseModel
from matplotlib.collections import LineCollection
from sklearn import manifold
from sklearn.metrics import euclidean_distances
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import pairwise_distances
from scipy.integrate import odeint
from analyzer.Analyzer import Analyzer

app = FastAPI()

class Ideas(BaseModel):
    content: str

@app.post("/api/process")
async def process_item(ideas_unprocessed: Ideas):
    # split ideas.content by newline
    ideas = [idea.strip() for idea in ideas_unprocessed.content.split('\n') if idea.strip()]
    (ideas_and_similarity, plot_data) = centroid_analysis(ideas)
    
    return {"message": ideas_and_similarity, "plot_data": plot_data}

def centroid_analysis(ideas: list):
    # Initialize CountVectorizer to convert text into numerical vectors
    count_vectorizer = CountVectorizer()
    analyzer = Analyzer(ideas, count_vectorizer)
    analyzer.process_all()

    table = []
    header = ["#", "Idea", "Cos Similarity", "Dist to centroid"]
    table.append(header)
    for i, idea in enumerate(analyzer.original_ideas):
        table.append([i+1, idea,round(analyzer.cos_similarity[i][0], 2), round(analyzer.distance_to_centroid[i][0], 2)])
    
    data = {}
    data["scatter_points"] = analyzer.coords
    return (table, data)   
