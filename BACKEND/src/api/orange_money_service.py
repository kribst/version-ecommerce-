"""
Service Orange Money côté serveur uniquement.
Toute communication avec l'API Orange Money est faite ici (pas de clé secrète côté frontend).
"""
import logging
import os
import requests
import uuid
from decimal import Decimal

logger = logging.getLogger(__name__)

# URLs Orange Money selon l'environnement
# Note: Les URLs réelles dépendent de l'API Orange Money utilisée
# Ici, on utilise une structure similaire à MTN MoMo
ORANGE_MONEY_API_SANDBOX = "https://api.orange.com/orange-money-webpay"
ORANGE_MONEY_API_PRODUCTION = "https://api.orange.com/orange-money-webpay"


def _base_url():
    mode = os.environ.get("ORANGE_MONEY_ENVIRONMENT", "sandbox").strip().lower()
    return ORANGE_MONEY_API_PRODUCTION if mode == "production" else ORANGE_MONEY_API_SANDBOX


def _get_access_token():
    """Obtenir le token d'accès Orange Money"""
    client_id = os.environ.get("ORANGE_MONEY_CLIENT_ID")
    client_secret = os.environ.get("ORANGE_MONEY_CLIENT_SECRET")
    
    if not all([client_id, client_secret]):
        raise ValueError("Les clés API Orange Money ne sont pas configurées")
    
    base_url = _base_url()
    token_url = f"{base_url}/oauth/v2/token"
    
    try:
        response = requests.post(
            token_url,
            auth=(client_id, client_secret),
            data={"grant_type": "client_credentials"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        return data.get("access_token")
    except requests.RequestException as e:
        logger.error(f"Erreur lors de l'obtention du token Orange Money: {e}")
        raise


def request_payment(phone_number, amount, currency="XAF", external_id=None):
    """
    Créer une demande de paiement Orange Money
    
    Args:
        phone_number: Numéro au format 237XXXXXXXXX
        amount: Montant en XAF
        currency: Devise (XAF par défaut)
        external_id: ID externe unique (généré si non fourni)
    
    Returns:
        dict avec transaction_id et status
    """
    if not external_id:
        external_id = f"ORANGE-{uuid.uuid4().hex[:12].upper()}"
    
    access_token = _get_access_token()
    base_url = _base_url()
    
    request_url = f"{base_url}/api/v1/webpayments"
    
    payload = {
        "merchant_key": os.environ.get("ORANGE_MONEY_MERCHANT_KEY", ""),
        "currency": currency,
        "order_id": external_id,
        "amount": str(amount),
        "return_url": os.environ.get("ORANGE_MONEY_RETURN_URL", ""),
        "cancel_url": os.environ.get("ORANGE_MONEY_CANCEL_URL", ""),
        "notif_url": os.environ.get("ORANGE_MONEY_NOTIF_URL", ""),
        "lang": "fr",
        "reference": f"Paiement de {amount} {currency}",
    }
    
    try:
        response = requests.post(
            request_url,
            json=payload,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            timeout=30
        )
        
        # 201 Created ou 200 OK = demande créée avec succès
        if response.status_code in [200, 201]:
            data = response.json()
            return {
                "success": True,
                "transaction_id": external_id,
                "status": "PENDING",
                "payment_url": data.get("payment_url", ""),
                "pay_token": data.get("pay_token", "")
            }
        else:
            error_data = response.json() if response.content else {}
            logger.error(f"Erreur Orange Money: {response.status_code} - {error_data}")
            return {
                "success": False,
                "message": error_data.get("message", f"Erreur {response.status_code}"),
                "transaction_id": external_id
            }
    except requests.RequestException as e:
        logger.error(f"Erreur réseau Orange Money: {e}")
        raise


def check_payment_status(transaction_id):
    """
    Vérifier le statut d'un paiement Orange Money
    
    Args:
        transaction_id: ID de la transaction
    
    Returns:
        dict avec status (SUCCESSFUL, PENDING, FAILED, etc.)
    """
    access_token = _get_access_token()
    base_url = _base_url()
    
    status_url = f"{base_url}/api/v1/webpayments/{transaction_id}/status"
    
    try:
        response = requests.get(
            status_url,
            headers={
                "Authorization": f"Bearer {access_token}",
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        return {
            "status": data.get("status", "UNKNOWN"),
            "transaction_id": transaction_id,
            "amount": data.get("amount"),
            "currency": data.get("currency"),
            "order_id": data.get("order_id"),
            "pay_token": data.get("pay_token")
        }
    except requests.RequestException as e:
        logger.error(f"Erreur lors de la vérification du statut: {e}")
        raise
