from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import stripe
import requests

powerbi = Blueprint("powerbi", __name__)

# Stripe setup
stripe.api_key = "your-stripe-secret-key"

# Power BI SKU IDs (replace with actual SKU IDs from Microsoft)
POWERBI_PRO_SKU_ID = "powerbi-pro-sku-id"
POWERBI_PREMIUM_SKU_ID = "powerbi-premium-sku-id"
POWERBI_ENTERPRISE_SKU_ID = "powerbi-enterprise-sku-id"

# Pricing in cents
PLAN_PRICES = {
    "pro": 2000,  # $20.00
    "premium": 5000,  # $50.00
    "enterprise": 10000,  # $100.00
}

@powerbi.route("/subscribe", methods=["POST"])
@jwt_required()
def subscribe():
    data = request.json
    user_email = data.get("email")
    plan = data.get("plan", "pro").lower()  # Default to 'pro' plan

    if plan not in PLAN_PRICES:
        return jsonify({"error": "Invalid plan selected"}), 400

    try:
        # Create a Stripe Payment Intent for the selected plan
        payment_intent = stripe.PaymentIntent.create(
            amount=PLAN_PRICES[plan],
            currency="usd",
            metadata={"plan": plan, "email": user_email},
        )

        # Assign Power BI license based on the selected plan
        access_token = "your-graph-api-access-token"  # Replace with your valid Microsoft Graph API token
        if plan == "pro":
            assign_powerbi_license(user_email, access_token, POWERBI_PRO_SKU_ID)
        elif plan == "premium":
            assign_powerbi_license(user_email, access_token, POWERBI_PREMIUM_SKU_ID)
        elif plan == "enterprise":
            assign_powerbi_license(user_email, access_token, POWERBI_ENTERPRISE_SKU_ID)

        return jsonify({
            "message": f"{plan.capitalize()} subscription successful",
            "payment_intent": payment_intent,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def assign_powerbi_license(user_email, access_token, sku_id):
    """
    Assign a Power BI license to a user using Microsoft Graph API.
    """
    url = f"https://graph.microsoft.com/v1.0/users/{user_email}/assignLicense"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    data = {
        "addLicenses": [{"skuId": sku_id}],
        "removeLicenses": []
    }

    response = requests.post(url, json=data, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Failed to assign license: {response.json()}")
    return response.json()
