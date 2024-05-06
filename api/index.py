from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Ideas(BaseModel):
    content: str

@app.get("/api/python")
def hello_world():
    return {"message": "Hello World"}

@app.post("/api/process")
async def process_item(ideas: Ideas):
    # split ideas.content by newline
    idea_list = [idea.strip() for idea in ideas.content.split('\n') if idea.strip()]

    transformed_content = centroid_analysis(idea_list)
    print("Analysed: ", transformed_content)
    return {"message": transformed_content}

@app.post("/api/testing")
async def testing():
    print("I'm here")
    return {"message": "Testing"}

import sys
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def centroid_analysis(ideas: list):
    # Initialize CountVectorizer to convert text into numerical vectors
    count_vectorizer = CountVectorizer()

    # Fit and transform the text data to numerical vectors
    idea_matrix = count_vectorizer.fit_transform(ideas)

    # Convert the idea matrix to a numpy array for easier calculations
    idea_array = idea_matrix.toarray()

    # Calculate the centroid (mean) of the idea array along axis 0 (rows)
    centroid = np.mean(idea_array, axis=0)

    # Calculate cosine similarity between each idea and the centroid
    similarities = cosine_similarity(idea_array, centroid.reshape(1, -1))

    # Create an object with the similarity scores for each idea
    results = [{"idea": ideas[i], "similarity": similarities[i][0]} for i in range(len(ideas))]
    return results