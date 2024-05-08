import numpy as np
import matplotlib.pyplot as plt, mpld3
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.manifold import MDS
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Ideas(BaseModel):
    content: str

@app.post("/api/process")
async def process_item(ideas: Ideas):
    # split ideas.content by newline
    idea_list = [idea.strip() for idea in ideas.content.split('\n') if idea.strip()]

    (transformed_content, scores) = centroid_analysis(idea_list)
    print("Analysed: ", transformed_content)
    (plot_as_html, path_to_png) = create_plot(scores)
    return {"message": transformed_content, "plot_html": plot_as_html, "plot_png": path_to_png}

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

    # MDS Multi-Dimensional Scaling
    mds = MDS(n_components=2, dissimilarity='precomputed', random_state=1)
    mds_fitted = mds.fit_transform(idea_array)
    print(mds_fitted)

    scores = [similarities[i][0] for i in range(len(ideas))]
    return (results, idea_matrix)

def create_plot(scores) -> str :

    # plt.ioff()
    fig = plt.figure(figsize=(8, 6))
    plt.imshow(scores, cmap='viridis', interpolation='nearest')
    plt.colorbar(label='Similarity Score')
    plt.title('Vector Graph of Similarity Scores')
    plt.xticks(np.arange(9), np.arange(1, 10))
    plt.yticks(np.arange(9), np.arange(1, 10))
    plt.xlabel('Idea Index')
    plt.ylabel('Idea Index')
    plt.grid(visible=True, linestyle='--', linewidth=0.5)
    as_html = mpld3.fig_to_html(fig, include_libraries=False, template_type="simple")
    # plt.savefig('static/plot.png')
    # plt.close(fig)
    plt.show()
    return (as_html, 'static/plot.png')
    
