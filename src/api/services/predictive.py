# services/predictive.py
from prophet import Prophet
import pandas as pd
# from api.models import SalesHistory

def predict_restock(db, product_id, reorder_point):
    # Fetch sales data for the product
    sales_data = db.session.query(SalesHistory).filter_by(product_id=product_id).all()
    df = pd.DataFrame([(s.date_sold, s.quantity_sold) for s in sales_data], columns=["ds", "y"])

    # Train Prophet model
    model = Prophet()
    model.fit(df)

    # Predict next 30 days
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)

    # Find the day where stock reaches the reorder point
    reorder_date = forecast[forecast['yhat'] <= reorder_point].iloc[0]['ds']
    return reorder_date
