import pandas as pd

def sales_trends(start_date, end_date):
    orders = Order.query.filter(Order.created_at.between(start_date, end_date)).all()
    df = pd.DataFrame([order.serialize() for order in orders])
    df['created_at'] = pd.to_datetime(df['created_at'])
    df.set_index('created_at', inplace=True)
    daily_sales = df['total_amount'].resample('D').sum()
    return daily_sales.to_dict()
