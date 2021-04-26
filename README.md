# TasteMates
User Recommendation System from Yelp Dataset

## Data
1. Downloaded [Yelp Dataset using Kaggle API](https://www.kaggle.com/yelp-dataset/yelp-dataset)[1] containing: 8,635,403 reviews, 160,585 businesses, 200,000 pictures, 8 metropolitan areas, 2,189457 users.
2. Filters
    - Business Location = Atlanta
    - Reviews  -> Restaurants in Atlanta
    - Users -> took out users who have fewer than 5 reviews

## DESCRIPTION (Describe the package in a few paragraphs)
### NLP
This package is contained in the /nlp directory. All code for analyzing textual review data is within  Reviews_NLP_and_Embeddings.ipynb. The package contains data loading and formatting cells to group by either business id or user id. This notebook generates files for textual user similarity and sorted lists of hotwords for download and use in the generation of word clouds in our API. The code is split into 3 blocks for data loading and imports, top-n textual user similarity, and a hotword extractor for restaurant reviews. This package uses the spaCy and NLTK python frameworks for NLP and automatically downloads the appropriate small English language model and PUNKT tokenizer model as dependencies of the bag-of-words token embedding, frequency analysis, and constituency parsing functionalities over cumulative review data.

### Content-Based Filtering for Recommending Restaurants
This package is contained within the /recommenders directory. All code for the recommender is within Content_Based_Filtering.ipynb. This package contains methods to get recommended restaurants given a specific restaurant id and to get recommended restaurants given a specific user_id. This recommender system is already connected to the Visualizations, therefore this notebook is only useful to test the standalone restaurant recommender. More information on how to reproduce results in shown below.

### Collaborative Filtering with Matrix Factorization for Recommending Buddies
1. Run the cells in ```data prep/Data_Preprocessing_and_Analysis.ipynb``` and follow provided instructions in order to procure Kaggle API key
2. Upload the output file from step 1 into ```recommenders/Collabortive_Filtering.ipynb```

The top similar users for each selected user in the visualization can be produced by rerunning the similarity calculation cell with different user ids.

The code in CF_Matching_Experiments.ipynb can be run to read in a json file of collaborative filtering user embeddings, generate a set of matchings via top-n user cosine similarity, perform tests for user coverage and user diversity over a random sampling of users, and generate an edges.csv file for a random sampling of users for use in the graph visualization software Argo Lite: https://poloclub.github.io/argo-graph-lite/
### Visualization
This package is contained within the /viz directory. There are three components in this package: map data, user data, and visualization code. The map data is in /viz/map_data and in /viz/poi   and contains the two files necessary for drawing the map of Atlanta. This data was obtained from [another project](https://gist.github.com/rgdonohue/366468f3f5f19a83303d7b2fbbfa2ece) on Github. city-limits.json is used to set the boundaries for the city of Atlanta and neighborhoods.json is used to create the individual neighborhoods within Atlanta for a more detailed map. The files in the /poi directory contain the chloropleth data for the the 4900 restaurants in the Atlanta area. This data contains the coordinates and neighborhood information for each restaurant, as obtained using the Google Maps Geocode API, to allow us to graph it. The user data is contained in the /user_data directory: user_info contains identifying information about the 10 users that we chose to use to test out our application. recommendations_for_selected_users.json contains the recommended businesses for each user (output by the Collaborative Filtering model), recommended buddies for each users (output by the Content-Based Filtering model), and matching scores for each. restaurant_hotwords.json contains the NLP-based hotwords from the reviews of a collection of restaurants and this is used to generate a word cloud for the restaurants. Finally, the visualization is created using atlanta_viz.html, viz.js, and viz.css. The /lib contains the necessary D3 libraries that we use in our visualization.


## INSTALLATION (How to install and setup your code)
### NLP
This code is dependant on the numpy, json, pyspark, csv, nltk, spacy, scipy, and sklearn for which cells are included to import and download the language model data. The Yelp data is read from a mounted Google Drive folder (which requires a Google authorization code to access) to which the notebooks in the /data_prep directory will have saved the appropriate reviews_sk json object for Spark import. The filepaths may need to be adjusted to reflect the file structure on your Drive.
### Content-Based Filtering for Recommending Restaurants
This code in dependent on properly installed and imported numpy, pandas, json, pyspark, and sklearn. We include cells to install the proper version of pyspark and download the Yelp Data required to work with the restaurant recommender after running the data preprocessing notebook.
### Collaborative Filtering with Matrix Factorization for Recommending Buddies
All the packages required for the tests in CF_Matching_Experiments.ipynb are imported in the first few cells. The JSON file of embeddings read in is created in the preceeding Data_Preprocessing_and_Analysis.ipynb notebook.
### Visualization
The visualization package is set up so that you can run everything directly out of the box. All necessary data files and libraries are included in the /viz directory so there is not extra set up necessary. If you want to change the user data that is being visualized, you need to update the user_data directory with the outputs from the two Recommender Systems. To see this visualization in action, you will need a browser. We strongly suggest using the latest version of Chrome to get the best possible experience.

## EXECUTION (How to run a demo on your code)
### NLP
The two sections of cells following the initial data and import automatically handle the grouping and concatenation of reviews, constituency parsing task, word embeddings, and cosine similarity computations and saves these outputs of user similarities with a specific user with format {user_id : similarity} and top n hotwords as {business_id : list of hotword strings} as json objects in the mounted Drive folder. 
### Content-Based Filtering for Recommending Restaurants
Running the notebook as is will produce a json of containing the best rated restaurants, recommended business ids for restaurants similiar to the best rated restaurants, and scores for each of the recommendations for each of the users in the user list. The user list can be modified in the final cell. The generated json has the following format {user_id : {best_rated_restaurants : list of id strings, recommended_business_id : list of id strings, scores : list floats}}.
### Collaborative Filtering with Matrix Factorization for Recommending Buddies
Run the Collaborative_Filtering.ipynb notebook to retrieve lists of similar users to a given user. This output can be fed into the visualization and experiments code.
Run the CF_Matching_Experiments.ipynb notebook to perform matching analysis and network structure file generation for use in the Argo Lite visualizer.
### Visualization
To run our visualization, open up to the /viz director in terminal and run ```python3 -m http.server```.
Open up your Chrome browser and go to "http://localhost:8000" and click on viz/atlanta_viz.html to launch the visualization.

[1]: https://www.kaggle.com/yelp-dataset/yelp-dataset
