"""
Service PayPal côté serveur uniquement.
Toute création et capture de paiement est faite ici (pas de clé secrète côté frontend).
"""
import logging
import os
import requests
from decimal import Decimal

logger = logging.getLogger(__name__)

# URLs PayPal selon l'environnement
PAYPAL_API_SANDBOX = "https://api-m.sandbox.paypal.com"
PAYPAL_API_LIVE = "https://api-m.paypal.com"


def _base_url():
    mode = os.environ.get("PAYPAL_MODE", "sandbox").strip().lower()
    return PAYPAL_API_LIVE if mode == "live" else PAYPAL_API_SANDBOX


def _auth_headers(access_token):
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }


def get_access_token():
    """
    Obtient un token OAuth2 PayPal (client_credentials).
    À appeler avant create_order et capture_order.
    """
    client_id = os.environ.get("PAYPAL_CLIENT_ID", "").strip()
    client_secret = os.environ.get("PAYPAL_CLIENT_SECRET", "").strip()
    if not client_id or not client_secret:
        raise ValueError("PAYPAL_CLIENT_ID et PAYPAL_CLIENT_SECRET doivent être définis")

    base = _base_url()
    url = f"{base}/v1/oauth2/token"
    response = requests.post(
        url,
        headers={"Accept": "application/json", "Accept-Language": "en_US"},
        auth=(client_id, client_secret),
        data={"grant_type": "client_credentials"},
        timeout=15,
    )
    response.raise_for_status()
    data = response.json()
    return data.get("access_token")


def create_order(amount_value, currency="EUR", return_url="", cancel_url=""):
    """
    Crée une commande PayPal (côté serveur).
    - amount_value: montant (ex: "10.00") dans la devise PayPal
    - currency: code devise (EUR, USD, etc.)
    - return_url / cancel_url: utilisés pour l'approbation (redirect)
    Retourne l'ID de la commande PayPal et le statut.
    """
    token = get_access_token()
    base = _base_url()
    url = f"{base}/v2/checkout/orders"

    # Montant au format string avec 2 décimales
    if isinstance(amount_value, Decimal):
        amount_str = str(amount_value.quantize(Decimal("0.01")))
    else:
        amount_str = f"{float(amount_value):.2f}"

    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": currency.upper(),
                    "value": amount_str,
                }
            }
        ],
    }
    if return_url or cancel_url:
        payload["application_context"] = {
            "return_url": return_url or cancel_url,
            "cancel_url": cancel_url or return_url,
        }

    response = requests.post(
        url,
        headers=_auth_headers(token),
        json=payload,
        timeout=15,
    )
    response.raise_for_status()
    data = response.json()
    order_id = data.get("id")
    if not order_id:
        raise ValueError("PayPal n'a pas retourné d'order ID")
    approve_url = ""
    for link in data.get("links", []):
        if link.get("rel") == "approve":
            approve_url = link.get("href", "")
            break
    return {"order_id": order_id, "status": data.get("status", ""), "approve_url": approve_url}


def capture_order(paypal_order_id):
    """
    Capture le paiement pour une commande PayPal déjà approuvée par l'utilisateur.
    À appeler uniquement après que le client a approuvé sur PayPal.
    Retourne les infos de capture (statut, montant, etc.).
    """
    token = get_access_token()
    base = _base_url()
    url = f"{base}/v2/checkout/orders/{paypal_order_id}/capture"

    response = requests.post(
        url,
        headers=_auth_headers(token),
        json={},
        timeout=15,
    )
    response.raise_for_status()
    return response.json()
