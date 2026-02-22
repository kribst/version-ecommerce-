"""
Service MTN Mobile Money côté serveur uniquement.
Toute communication avec l'API MTN est faite ici (pas de clé secrète côté frontend).
"""
import logging
import os
import requests
import uuid
from decimal import Decimal

logger = logging.getLogger(__name__)

# URLs MTN MoMo selon l'environnement
MTN_MOMO_API_SANDBOX = "https://sandbox.momodeveloper.mtn.com"
MTN_MOMO_API_PRODUCTION = "https://momodeveloper.mtn.com"


def _base_url():
    mode = os.environ.get("MTN_MOMO_ENVIRONMENT", "sandbox").strip().lower()
    return MTN_MOMO_API_PRODUCTION if mode == "production" else MTN_MOMO_API_SANDBOX


def _get_access_token():
    """Obtenir le token d'accès MTN MoMo"""
    subscription_key = os.environ.get("MTN_MOMO_SUBSCRIPTION_KEY")
    api_user = os.environ.get("MTN_MOMO_API_USER")
    api_key = os.environ.get("MTN_MOMO_API_KEY")
    
    if not all([subscription_key, api_user, api_key]):
        raise ValueError("Les clés API MTN MoMo ne sont pas configurées")
    
    base_url = _base_url()
    token_url = f"{base_url}/collection/token/"
    
    try:
        response = requests.post(
            token_url,
            auth=(api_user, api_key),
            headers={
                "Ocp-Apim-Subscription-Key": subscription_key
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        return data.get("access_token")
    except requests.RequestException as e:
        logger.error(f"Erreur lors de l'obtention du token MTN MoMo: {e}")
        raise


def request_payment(phone_number, amount, currency="XAF", external_id=None):
    """
    Créer une demande de paiement MTN MoMo
    
    Args:
        phone_number: Numéro au format 237XXXXXXXXX
        amount: Montant en XAF
        currency: Devise (XAF par défaut)
        external_id: ID externe unique (généré si non fourni)
    
    Returns:
        dict avec transaction_id et status
    """
    if not external_id:
        external_id = f"REF-{uuid.uuid4().hex[:12].upper()}"
    
    access_token = _get_access_token()
    subscription_key = os.environ.get("MTN_MOMO_SUBSCRIPTION_KEY")
    target_environment = os.environ.get("MTN_MOMO_TARGET_ENVIRONMENT", "mtncameroon")
    base_url = _base_url()
    
    request_url = f"{base_url}/collection/v1_0/requesttopay"
    
    payload = {
        "amount": str(amount),
        "currency": currency,
        "externalId": external_id,
        "payer": {
            "partyIdType": "MSISDN",
            "partyId": phone_number
        },
        "payerMessage": f"Paiement de {amount} {currency}",
        "payeeNote": "Commande e-commerce"
    }
    
    try:
        response = requests.post(
            request_url,
            json=payload,
            headers={
                "Authorization": f"Bearer {access_token}",
                "X-Target-Environment": target_environment,
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": subscription_key,
                "X-Reference-Id": external_id
            },
            timeout=30
        )
        
        # 202 Accepted = demande créée avec succès
        if response.status_code == 202:
            return {
                "success": True,
                "transaction_id": external_id,
                "status": "PENDING"
            }
        else:
            error_data = response.json() if response.content else {}
            logger.error(f"Erreur MTN MoMo: {response.status_code} - {error_data}")
            return {
                "success": False,
                "message": error_data.get("message", f"Erreur {response.status_code}"),
                "transaction_id": external_id
            }
    except requests.RequestException as e:
        logger.error(f"Erreur réseau MTN MoMo: {e}")
        raise


def check_payment_status(transaction_id):
    """
    Vérifier le statut d'un paiement MTN MoMo
    
    Args:
        transaction_id: ID de la transaction
    
    Returns:
        dict avec status (SUCCESSFUL, PENDING, FAILED, etc.)
    """
    access_token = _get_access_token()
    subscription_key = os.environ.get("MTN_MOMO_SUBSCRIPTION_KEY")
    target_environment = os.environ.get("MTN_MOMO_TARGET_ENVIRONMENT", "mtncameroon")
    base_url = _base_url()
    
    status_url = f"{base_url}/collection/v1_0/requesttopay/{transaction_id}"
    
    try:
        response = requests.get(
            status_url,
            headers={
                "Authorization": f"Bearer {access_token}",
                "X-Target-Environment": target_environment,
                "Ocp-Apim-Subscription-Key": subscription_key
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
            "financialTransactionId": data.get("financialTransactionId"),
            "externalId": data.get("externalId")
        }
    except requests.RequestException as e:
        logger.error(f"Erreur lors de la vérification du statut: {e}")
        raise
