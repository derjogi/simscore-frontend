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

app = FastAPI()

class Ideas(BaseModel):
    content: str

@app.post("/api/process")
async def process_item(ideas_unprocessed: Ideas):
    # split ideas.content by newline
    ideas = [idea.strip() for idea in ideas_unprocessed.content.split('\n') if idea.strip()]
    (ideas_and_similarity, plot_as_html, path_to_png) = centroid_analysis(ideas)
    
    return {"message": ideas_and_similarity, "plot_html": plot_as_html, "plot_png": path_to_png}

def centroid_analysis(ideas: list):
    # Initialize CountVectorizer to convert text into numerical vectors
    count_vectorizer = CountVectorizer()

    # Fit and transform the text data to numerical vectors
    idea_matrix = count_vectorizer.fit_transform(ideas)

    # Convert the idea matrix to a numpy array for easier calculations
    idea_array = idea_matrix.toarray()

    # Calculate the centroid (mean) of the idea array along axis 0 (rows)
    centroid = np.mean(idea_array, axis=0)

    # Add the centroid as another row/column
    idea_array = np.vstack([idea_array, centroid])

    # Calculate similarity & distances
    cos_similarity = cosine_similarity(idea_array, centroid.reshape(1, -1))
    pairwise_similarity = cosine_similarity(idea_array, idea_array)
    pairwise_distance = pairwise_distances(idea_array, metric='cosine')

    # Distance of the centroid to each other idea
    centroid_distance = pairwise_distance[-1, :-1]

    # make it so that 0 is 'same' and 1 is very different:
    distance_to_centroid = 1 - cos_similarity


    ### Print info
    # Create an object with the similarity scores for each idea
    print('Cosine similarity: ')
    for row in cos_similarity:
        print("{:.2f}".format(*row), sep='')

    print('Distance to centroid: (-1 * x): ')
    for row in distance_to_centroid:
        print("{:.2f}".format(*row), sep='')

    ideas_and_similarities = [{"idea": ideas[i], "dist": distance_to_centroid[i][0]} for i in range(len(ideas))]
    
    # scores = [similarities[i][0] for i in range(len(ideas))]
    (plot_as_html, path_to_fig) = mds_plot(pairwise_distance, distance_to_centroid, pairwise_similarity)
    return (ideas_and_similarities, plot_as_html, path_to_fig)


def mds_plot(pairwise_distance, distance_to_centroid, pairwise_similarity):
    r_state = np.random.RandomState()

    # For reproducible results, set r_int to a fixed number.
    r_int = r_state.randint(1, 1000000)
    mds = manifold.MDS(n_components=2, dissimilarity='precomputed', random_state=r_int)
    print(r_int)

    coords = mds.fit_transform(pairwise_distance)
    fig, ax = plt.subplots(figsize=(8, 6))

    # Normalize the distance_to_centroid array for marker size scaling
    marker_sizes = pow((1 - distance_to_centroid), 3) * 300
    marker_sizes[-1] = 100   # Centroid marker size

    scatter = ax.scatter(coords[:, 0], coords[:, 1], c=distance_to_centroid, cmap='viridis', s=marker_sizes)

    # Stronger Connection Lines for stronger pairwise similarities: 
    segments = []
    line_weights = []
    for i in range(len(coords)):
        for j in range(len(coords)):
            segments.append([coords[i], coords[j]])
            line_weights.append(pow(pairwise_similarity[i,j], 2))

    lc = LineCollection(
        segments, zorder=0, cmap=plt.cm.Blues, norm=plt.Normalize(0, 1), linewidths=line_weights
    )
    ax.add_collection(lc)

    # Add labels to each point
    labels = []
    for i, dist in enumerate(coords):
        if i == len(coords)-1:
            labels.append(ax.annotate(f"Centroid", (coords[i, 0], coords[i, 1]), xytext=(7, 3), textcoords='offset pixels'))
        else:
            dist_round = round(dist[0], 2)
            text = f"{i+1}"
            label = ax.annotate(text, (coords[i, 0], coords[i, 1]), xytext=(7, 3), textcoords='offset pixels')
            labels.append(label)

    # Add a colorbar to show the mapping of colors to distances
    cbar = fig.colorbar(scatter, ax=ax)
    cbar.set_label('Distance to Centroid')

    # Set the axis labels and title
    ax.set_title('Distance to Centroid Visualization')

    # Show the plot
    as_html = mpld3.fig_to_html(fig, include_libraries=True, template_type="simple")
    path_to_fig = 'plot.png'
    plt.savefig('public/'+path_to_fig)

    return (as_html, path_to_fig)
    

def print_text(ideas_and_similarities, coords):
    print(f"# \t dist to center \t coords")
    for i, item in enumerate(ideas_and_similarities):
        print(f"{i+1} \t {item['idea']} \t {round(item['dist'], 2)} \t ({round(coords[i][0], 2)}|{round(coords[i][1], 2)})")


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
    
