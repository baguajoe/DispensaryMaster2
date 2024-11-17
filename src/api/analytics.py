import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

def predict_sales_trends():
    # Fetch completed orders
    orders = Order.query.filter(Order.status == 'completed').all()
    df = pd.DataFrame([order.serialize() for order in orders])

    # Ensure there are enough records
    if df.shape[0] < 2:
        return {"error": "Not enough data for predictions"}

    # Prepare data
    df['created_at'] = pd.to_datetime(df['created_at'])
    df.sort_values(by='created_at', inplace=True)
    df['days_since_start'] = (df['created_at'] - df['created_at'].min()).dt.days
    X = df[['days_since_start']].values
    y = df['total_amount'].values

    # Train model
    model = LinearRegression()
    model.fit(X, y)

    # Predict future trends
    future_days = np.array([[i] for i in range(df['days_since_start'].max() + 1, df['days_since_start'].max() + 31)])
    predictions = model.predict(future_days)

    # Return results
    return {
        "predictions": predictions.tolist(),
        "start_date": df['created_at'].min().strftime('%Y-%m-%d'),
        "future_dates": [(df['created_at'].min() + pd.Timedelta(days=int(day[0]))).strftime('%Y-%m-%d') for day in future_days]
    }
