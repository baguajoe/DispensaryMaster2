import pandas as pd
from surprise import SVD, Dataset, Reader
import joblib

# Sample data for training the recommendation model
def get_sample_data():
    """
    Returns sample customer-product purchase data.
    Replace this function with actual database queries in production.
    """
    data = pd.DataFrame({
        "customer_id": [1, 1, 2, 2, 3],
        "product_id": [101, 102, 101, 103, 102],
        "rating": [5, 4, 5, 3, 4]  # Ratings can be implicit feedback (e.g., frequency)
    })
    return data

def train_recommendation_model():
    """
    Trains a recommendation model using collaborative filtering (SVD) and saves it.
    """
    print("Fetching data...")
    data = get_sample_data()

    # Prepare the dataset for Surprise
    reader = Reader(rating_scale=(1, 5))
    dataset = Dataset.load_from_df(data[["customer_id", "product_id", "rating"]], reader)
    trainset = dataset.build_full_trainset()

    print("Training the model...")
    # Train the recommendation model using Singular Value Decomposition (SVD)
    model = SVD()
    model.fit(trainset)

    # Save the trained model to a file
    model_file = "backend/models/recommendation_model.pkl"
    joblib.dump(model, model_file)
    print(f"Model saved to {model_file}")

def main():
    """
    Main function to trigger the model training and saving process.
    """
    train_recommendation_model()

if __name__ == "__main__":
    main()
