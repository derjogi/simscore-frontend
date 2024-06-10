import os
import numpy as np
import matplotlib.pyplot as plt, mpld3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

ACCESS_CONTROL_ALLOW_CREDENTIALS = os.environ.get(
    'ACCESS_CONTROL_ALLOW_CREDENTIALS', 
    "true")
ACCESS_CONTROL_ALLOW_ORIGIN = os.environ.get(
    'ACCESS_CONTROL_ALLOW_ORIGIN', 
    "*").split(",")
ACCESS_CONTROL_ALLOW_METHODS = os.environ.get(
    'ACCESS_CONTROL_ALLOW_METHODS', 
    "GET,OPTIONS,PATCH,DELETE,POST,PUT").split(",")
ACCESS_CONTROL_ALLOW_HEADERS = os.environ.get(
    'ACCESS_CONTROL_ALLOW_HEADERS', 
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version").split(",")

app.add_middleware(CORSMiddleware, 
                   allow_origins=ACCESS_CONTROL_ALLOW_ORIGIN,
                   allow_credentials=ACCESS_CONTROL_ALLOW_CREDENTIALS,
                   allow_methods=ACCESS_CONTROL_ALLOW_METHODS,
                   allow_headers=ACCESS_CONTROL_ALLOW_HEADERS
                   )

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
