 "use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { paypalAPI } from "@/utils/api";
import { mtnMoMoAPI } from "@/utils/api";
import { orangeMoneyAPI } from "@/utils/api";
import MTNPaymentModal from "@/components/MTNPaymentModal/MTNPaymentModal";
import styles from "./Checkout.module.css";

const PAYMENT_BANK = "bank";
const PAYMENT_CHEQUE = "cheque";
const PAYMENT_PAYPAL = "paypal";

// Statuts de paiement MTN MoMo
const MTN_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

// Statuts de paiement Orange Money
const ORANGE_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_PAYPAL);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [paypalReturnProcessed, setPaypalReturnProcessed] = useState(false);
  
  // États pour MTN Mobile Money
  const [mtnModalOpen, setMtnModalOpen] = useState(false);
  const [mtnPaymentStatus, setMtnPaymentStatus] = useState(MTN_STATUS.PENDING);
  const [mtnTransactionId, setMtnTransactionId] = useState(null);
  const [mtnErrorMessage, setMtnErrorMessage] = useState("");
  const pollingIntervalRef = useRef(null);
  
  // États pour Orange Money
  const [orangeModalOpen, setOrangeModalOpen] = useState(false);
  const [orangePaymentStatus, setOrangePaymentStatus] = useState(ORANGE_STATUS.PENDING);
  const [orangeTransactionId, setOrangeTransactionId] = useState(null);
  const [orangeErrorMessage, setOrangeErrorMessage] = useState("");
  const orangePollingIntervalRef = useRef(null);

  const [billing, setBilling] = useState({
    first_name: "",
    last_name: "",
    email: "",
    address: "",
    city: "",
    country: "",
    zip_code: "",
    phone: "",
  });

  const updateBilling = (field, value) => {
    setBilling((prev) => ({ ...prev, [field]: value }));
  };

  // Validation du numéro de téléphone Orange Cameroun
  const validateOrangePhone = (phone) => {
    if (!phone) return { valid: false, message: "Le numéro de téléphone est requis." };
    
    // Nettoyer le numéro (supprimer espaces, tirets, etc.)
    const cleaned = phone.replace(/\D/g, "");
    
    // Formats acceptés:
    // - +237 6XX XXX XXX ou 9XX XXX XXX (Orange)
    // - 237 6XX XXX XXX ou 9XX XXX XXX
    // - 6XX XXX XXX ou 9XX XXX XXX
    
    let phoneNumber = cleaned;
    
    // Si commence par 237, le garder
    if (cleaned.startsWith("237")) {
      phoneNumber = cleaned;
    } else if ((cleaned.startsWith("6") || cleaned.startsWith("9")) && cleaned.length === 9) {
      // Format local: 6XX XXX XXX ou 9XX XXX XXX -> ajouter 237
      phoneNumber = "237" + cleaned;
    } else {
      return {
        valid: false,
        message: "Format invalide. Utilisez: +237 6XX XXX XXX ou 9XX XXX XXX",
      };
    }
    
    // Vérifier que c'est un numéro Orange valide (237 + 9 chiffres, commençant par 6 ou 9)
    if (phoneNumber.length !== 12 || (!phoneNumber.startsWith("2376") && !phoneNumber.startsWith("2379"))) {
      return {
        valid: false,
        message: "Le numéro doit être un numéro Orange valide (237 6XX XXX XXX ou 9XX XXX XXX).",
      };
    }
    
    return { valid: true, phoneNumber };
  };

  // Validation du numéro de téléphone MTN Cameroun
  const validateMTNPhone = (phone) => {
    if (!phone) return { valid: false, message: "Le numéro de téléphone est requis." };
    
    // Nettoyer le numéro (supprimer espaces, tirets, etc.)
    const cleaned = phone.replace(/\D/g, "");
    
    // Formats acceptés:
    // - +237 6XX XXX XXX
    // - 237 6XX XXX XXX
    // - 6XX XXX XXX
    // - 6XXXXXXXXX
    
    let phoneNumber = cleaned;
    
    // Si commence par 237, le garder
    if (cleaned.startsWith("237")) {
      phoneNumber = cleaned;
    } else if (cleaned.startsWith("6") && cleaned.length === 9) {
      // Format local: 6XX XXX XXX -> ajouter 237
      phoneNumber = "237" + cleaned;
    } else {
      return {
        valid: false,
        message: "Format invalide. Utilisez: +237 6XX XXX XXX ou 6XX XXX XXX",
      };
    }
    
    // Vérifier que c'est un numéro MTN valide (237 + 9 chiffres, commençant par 6)
    if (phoneNumber.length !== 12 || !phoneNumber.startsWith("2376")) {
      return {
        valid: false,
        message: "Le numéro doit être un numéro MTN valide (237 6XX XXX XXX).",
      };
    }
    
    return { valid: true, phoneNumber };
  };

  // Nettoyer l'intervalle de polling
  const clearPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Nettoyer l'intervalle de polling Orange
  const clearOrangePolling = useCallback(() => {
    if (orangePollingIntervalRef.current) {
      clearInterval(orangePollingIntervalRef.current);
      orangePollingIntervalRef.current = null;
    }
  }, []);

  // Vérifier le statut du paiement MTN MoMo
  const checkMTNPaymentStatus = useCallback(async (transactionId) => {
    try {
      const data = await mtnMoMoAPI.checkPaymentStatus(transactionId);
      
      if (data?.status === "SUCCESSFUL" || data?.status === "success") {
        setMtnPaymentStatus(MTN_STATUS.SUCCESS);
        clearPolling();
        clearCart();
        // Rediriger vers la page de succès après un court délai
        setTimeout(() => {
          setMtnModalOpen(false);
          router.push("/PaymentSuccess");
        }, 2000);
      } else if (data?.status === "FAILED" || data?.status === "failed") {
        setMtnPaymentStatus(MTN_STATUS.FAILED);
        setMtnErrorMessage(data?.message || "Le paiement a échoué.");
        clearPolling();
      } else if (data?.status === "CANCELLED" || data?.status === "cancelled") {
        setMtnPaymentStatus(MTN_STATUS.CANCELLED);
        clearPolling();
      }
      // Si PENDING, continuer le polling
    } catch (err) {
      console.error("Erreur lors de la vérification du statut:", err);
      // Ne pas arrêter le polling en cas d'erreur réseau temporaire
    }
  }, [clearPolling, clearCart, router]);

  // Démarrer le polling pour vérifier le statut
  const startPolling = useCallback((transactionId) => {
    // Vérifier immédiatement
    checkMTNPaymentStatus(transactionId);
    
    // Puis vérifier toutes les 3 secondes
    pollingIntervalRef.current = setInterval(() => {
      checkMTNPaymentStatus(transactionId);
    }, 3000);
    
    // Arrêter après 5 minutes maximum
    setTimeout(() => {
      clearPolling();
      if (mtnPaymentStatus === MTN_STATUS.PENDING) {
        setMtnPaymentStatus(MTN_STATUS.FAILED);
        setMtnErrorMessage("Le délai d'attente a expiré. Veuillez réessayer.");
      }
    }, 300000); // 5 minutes
  }, [checkMTNPaymentStatus, clearPolling, mtnPaymentStatus]);

  // Nettoyer le polling au démontage
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (orangePollingIntervalRef.current) {
        clearInterval(orangePollingIntervalRef.current);
        orangePollingIntervalRef.current = null;
      }
    };
  }, []);

  // Vérifier le statut du paiement Orange Money
  const checkOrangePaymentStatus = useCallback(async (transactionId) => {
    try {
      const data = await orangeMoneyAPI.checkPaymentStatus(transactionId);
      
      if (data?.status === "SUCCESSFUL" || data?.status === "success") {
        setOrangePaymentStatus(ORANGE_STATUS.SUCCESS);
        clearOrangePolling();
        clearCart();
        // Rediriger vers la page de succès après un court délai
        setTimeout(() => {
          setOrangeModalOpen(false);
          router.push("/PaymentSuccess");
        }, 2000);
      } else if (data?.status === "FAILED" || data?.status === "failed") {
        setOrangePaymentStatus(ORANGE_STATUS.FAILED);
        setOrangeErrorMessage(data?.message || "Le paiement a échoué.");
        clearOrangePolling();
      } else if (data?.status === "CANCELLED" || data?.status === "cancelled") {
        setOrangePaymentStatus(ORANGE_STATUS.CANCELLED);
        clearOrangePolling();
      }
      // Si PENDING, continuer le polling
    } catch (err) {
      console.error("Erreur lors de la vérification du statut:", err);
      // Ne pas arrêter le polling en cas d'erreur réseau temporaire
    }
  }, [clearOrangePolling, clearCart, router]);

  // Démarrer le polling pour vérifier le statut Orange
  const startOrangePolling = useCallback((transactionId) => {
    // Vérifier immédiatement
    checkOrangePaymentStatus(transactionId);
    
    // Puis vérifier toutes les 3 secondes
    orangePollingIntervalRef.current = setInterval(() => {
      checkOrangePaymentStatus(transactionId);
    }, 3000);
    
    // Arrêter après 5 minutes maximum
    setTimeout(() => {
      clearOrangePolling();
      if (orangePaymentStatus === ORANGE_STATUS.PENDING) {
        setOrangePaymentStatus(ORANGE_STATUS.FAILED);
        setOrangeErrorMessage("Le délai d'attente a expiré. Veuillez réessayer.");
      }
    }, 300000); // 5 minutes
  }, [checkOrangePaymentStatus, clearOrangePolling, orangePaymentStatus]);

  const formatPrice = (num) => {
    const value = typeof num === "number" ? num : Number(num || 0);
    return Math.round(value).toLocaleString("fr-FR");
  };

  const numberToWordsFR = (number) => {
    const units = [
      "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
      "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
      "dix-sept", "dix-huit", "dix-neuf",
    ];
    const tens = [
      "", "", "vingt", "trente", "quarante", "cinquante",
      "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix",
    ];
    const convertHundreds = (n) => {
      let result = "";
      if (n >= 100) {
        const h = Math.floor(n / 100);
        result += (h > 1 ? units[h] + " " : "") + "cent";
        n %= 100;
        if (n > 0) result += " ";
      }
      if (n >= 20) {
        const t = Math.floor(n / 10);
        result += tens[t];
        n %= 10;
        if (n > 0) result += "-" + units[n];
      } else if (n > 0) {
        result += units[n];
      }
      return result;
    };
    const convert = (n) => {
      if (n === 0) return units[0];
      let words = "";
      if (n >= 1_000_000) {
        const millions = Math.floor(n / 1_000_000);
        words += (millions > 1 ? convertHundreds(millions) + " millions" : "un million");
        n %= 1_000_000;
        if (n > 0) words += " ";
      }
      if (n >= 1000) {
        const thousands = Math.floor(n / 1000);
        words += (thousands > 1 ? convertHundreds(thousands) + " mille" : "mille");
        n %= 1000;
        if (n > 0) words += " ";
      }
      if (n > 0) words += convertHundreds(n);
      return words;
    };
    return convert(Math.floor(number));
  };

  // Retour PayPal : capturer le paiement puis vider le panier
  const processPayPalReturn = useCallback(async (token) => {
    if (paypalReturnProcessed || !token) return;
    setPaypalReturnProcessed(true);
    setPlacing(true);
    setError("");
    try {
      const data = await paypalAPI.captureOrder(token);
      if (data?.success) {
        clearCart();
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", window.location.pathname);
        }
        // Redirection vers une page de succès dédiée
        router.push("/PaymentSuccess");
      } else {
        setError("Le paiement n'a pas pu être finalisé.");
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Erreur lors de la finalisation du paiement.";
      setError(msg);
    } finally {
      setPlacing(false);
    }
  }, [paypalReturnProcessed, clearCart, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paypalSuccess = params.get("paypal") === "success";
    const token = params.get("token");
    if (paypalSuccess && token) {
      processPayPalReturn(token);
    }
  }, [processPayPalReturn]);

  // Quand une erreur apparaît, faire défiler vers le haut pour la rendre visible
  useEffect(() => {
    if (!error) return;
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);

  const handlePlaceOrder = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setError("");
    if (!cart?.length) {
      setError("Votre panier est vide.");
      return;
    }
    if (!termsAccepted) {
      setError("Veuillez accepter les conditions générales.");
      return;
    }

    if (paymentMethod === PAYMENT_PAYPAL) {
      // Champs de facturation obligatoires (sauf code postal)
      const requiredFields = [
        { key: "first_name", label: "Prénom" },
        { key: "last_name", label: "Nom" },
        { key: "email", label: "Email" },
        { key: "address", label: "Adresse" },
        { key: "city", label: "Ville" },
        { key: "country", label: "Pays" },
        { key: "phone", label: "Téléphone" },
      ];

      const missing = requiredFields.filter(
        ({ key }) => !billing[key] || !billing[key].toString().trim()
      );

      if (missing.length > 0) {
        const fieldLabels = missing.map((f) => f.label).join(", ");
        setError(`Veuillez renseigner tous les champs obligatoires : ${fieldLabels}.`);
        return;
      }

      setPlacing(true);
      try {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        const returnUrl = `${baseUrl}/Check?paypal=success`;
        const cancelUrl = `${baseUrl}/Check?paypal=cancel`;
        const payload = {
          cart: cart.map((item) => ({
            id: item.id,
            name: item.name || "",
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
          })),
          billing: {
            email: billing.email.trim(),
            first_name: billing.first_name.trim(),
            last_name: billing.last_name.trim(),
            address: billing.address.trim(),
            city: billing.city.trim(),
            country: billing.country.trim(),
            zip_code: billing.zip_code.trim(),
            phone: billing.phone.trim(),
          },
          return_url: returnUrl,
          cancel_url: cancelUrl,
        };
        const data = await paypalAPI.createOrder(payload);
        const approveUrl = data?.approveUrl;
        if (approveUrl) {
          window.location.href = approveUrl;
          return;
        }
        setError("Impossible de rediriger vers PayPal. Réessayez.");
      } catch (err) {
        const detail = err.response?.data?.detail;
        const msg = typeof detail === "string"
          ? detail
          : err.response?.data?.message || err.message || "Erreur lors de la création du paiement.";
        setError(msg);
      } finally {
        setPlacing(false);
      }
      return;
    }

    // Paiement Orange Money
    if (paymentMethod === PAYMENT_BANK) {
      // Validation des champs obligatoires
      const requiredFields = [
        { key: "first_name", label: "Prénom" },
        { key: "last_name", label: "Nom" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Téléphone Orange" },
      ];

      const missing = requiredFields.filter(
        ({ key }) => !billing[key] || !billing[key].toString().trim()
      );

      if (missing.length > 0) {
        const fieldLabels = missing.map((f) => f.label).join(", ");
        setError(`Veuillez renseigner tous les champs obligatoires : ${fieldLabels}.`);
        return;
      }

      // Validation du numéro de téléphone Orange
      const phoneValidation = validateOrangePhone(billing.phone);
      if (!phoneValidation.valid) {
        setError(phoneValidation.message);
        return;
      }

      setPlacing(true);
      setError("");
      
      try {
        const payload = {
          cart: cart.map((item) => ({
            id: item.id,
            name: item.name || "",
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
          })),
          billing: {
            email: billing.email.trim(),
            first_name: billing.first_name.trim(),
            last_name: billing.last_name.trim(),
            address: billing.address.trim(),
            city: billing.city.trim(),
            country: billing.country.trim() || "Cameroun",
            zip_code: billing.zip_code.trim(),
            phone: phoneValidation.phoneNumber, // Numéro formaté
          },
          amount: Math.round(cartTotal),
          currency: "XAF",
        };

        // Vérification de sécurité
        if (!orangeMoneyAPI || typeof orangeMoneyAPI.requestPayment !== 'function') {
          setError("Le service de paiement Orange Money n'est pas disponible. Veuillez réessayer plus tard.");
          setPlacing(false);
          return;
        }

        const data = await orangeMoneyAPI.requestPayment(payload);
        
        if (data?.success && data?.transactionId) {
          setOrangeTransactionId(data.transactionId);
          setOrangePaymentStatus(ORANGE_STATUS.PENDING);
          setOrangeErrorMessage("");
          setOrangeModalOpen(true);
          setPlacing(false);
          
          // Démarrer le polling pour vérifier le statut
          startOrangePolling(data.transactionId);
        } else {
          setError(data?.message || "Impossible d'initier le paiement Orange Money. Réessayez.");
          setPlacing(false);
        }
      } catch (err) {
        const detail = err.response?.data?.detail;
        const msg = typeof detail === "string"
          ? detail
          : err.response?.data?.message || err.message || "Erreur lors de la création du paiement Orange Money.";
        setError(msg);
        setPlacing(false);
      }
      return;
    }

    // Paiement MTN Mobile Money
    if (paymentMethod === PAYMENT_CHEQUE) {
      // Validation des champs obligatoires
      const requiredFields = [
        { key: "first_name", label: "Prénom" },
        { key: "last_name", label: "Nom" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Téléphone MTN" },
      ];

      const missing = requiredFields.filter(
        ({ key }) => !billing[key] || !billing[key].toString().trim()
      );

      if (missing.length > 0) {
        const fieldLabels = missing.map((f) => f.label).join(", ");
        setError(`Veuillez renseigner tous les champs obligatoires : ${fieldLabels}.`);
        return;
      }

      // Validation du numéro de téléphone MTN
      const phoneValidation = validateMTNPhone(billing.phone);
      if (!phoneValidation.valid) {
        setError(phoneValidation.message);
        return;
      }

      setPlacing(true);
      setError("");
      
      try {
        const payload = {
          cart: cart.map((item) => ({
            id: item.id,
            name: item.name || "",
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
          })),
          billing: {
            email: billing.email.trim(),
            first_name: billing.first_name.trim(),
            last_name: billing.last_name.trim(),
            address: billing.address.trim(),
            city: billing.city.trim(),
            country: billing.country.trim() || "Cameroun",
            zip_code: billing.zip_code.trim(),
            phone: phoneValidation.phoneNumber, // Numéro formaté
          },
          amount: Math.round(cartTotal),
          currency: "XAF",
        };

        // Vérification de sécurité
        if (!mtnMoMoAPI || typeof mtnMoMoAPI.requestPayment !== 'function') {
          setError("Le service de paiement MTN Mobile Money n'est pas disponible. Veuillez réessayer plus tard.");
          setPlacing(false);
          return;
        }

        const data = await mtnMoMoAPI.requestPayment(payload);
        
        if (data?.success && data?.transactionId) {
          setMtnTransactionId(data.transactionId);
          setMtnPaymentStatus(MTN_STATUS.PENDING);
          setMtnErrorMessage("");
          setMtnModalOpen(true);
          setPlacing(false);
          
          // Démarrer le polling pour vérifier le statut
          startPolling(data.transactionId);
        } else {
          setError(data?.message || "Impossible d'initier le paiement MTN Mobile Money. Réessayez.");
          setPlacing(false);
        }
      } catch (err) {
        const detail = err.response?.data?.detail;
        const msg = typeof detail === "string"
          ? detail
          : err.response?.data?.message || err.message || "Erreur lors de la création du paiement MTN Mobile Money.";
        setError(msg);
        setPlacing(false);
      }
      return;
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.container}>
        {successMessage && (
          <div className={styles.successMessage} role="alert">
            {successMessage}
          </div>
        )}
        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}
        <div className={styles.row}>
          <div className={styles.col5}>
            <div className={styles.billingDetails}>
              <h3 className={styles.title}>Adresse de facturation</h3>
              <input
                className={styles.input}
                placeholder="Prénom"
                value={billing.first_name}
                onChange={(e) => updateBilling("first_name", e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="Nom"
                value={billing.last_name}
                onChange={(e) => updateBilling("last_name", e.target.value)}
              />
              <input
                className={styles.input}
                type="email"
                placeholder="Email *"
                value={billing.email}
                onChange={(e) => updateBilling("email", e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="Adresse"
                value={billing.address}
                onChange={(e) => updateBilling("address", e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="Ville"
                value={billing.city}
                onChange={(e) => updateBilling("city", e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="Pays"
                value={billing.country}
                onChange={(e) => updateBilling("country", e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="Code postal"
                value={billing.zip_code}
                onChange={(e) => updateBilling("zip_code", e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="Téléphone"
                value={billing.phone}
                onChange={(e) => updateBilling("phone", e.target.value)}
              />
              <label className={styles.checkbox}>
                <input type="checkbox" /> Créer un compte ?
              </label>
            </div>
          </div>

          <div className={styles.col7}>
            <h3 className={styles.titleCenter}>Votre commande</h3>
            <div className={styles.orderBox}>
              <table className={styles.orderTable}>
                <thead>
                  <tr>
                    <th>QTÉ</th>
                    <th>PRODUIT</th>
                    <th>PRIX</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan="3" className={styles.emptyCart}>
                        Votre panier est vide
                      </td>
                    </tr>
                  ) : (
                    <>
                      {cart.map((item) => (
                        <tr key={item.id}>
                          <td>{item.quantity || 1}</td>
                          <td>{item.name}</td>
                          <td>
                            {formatPrice((item.price || 0) * (item.quantity || 1))} CFA
                          </td>
                        </tr>
                      ))}
                      <tr className={styles.shippingRow}>
                        <td colSpan="2">Livraison</td>
                        <td><strong>GRATUITE</strong></td>
                      </tr>
                      <tr className={styles.totalRow}>
                        <td colSpan="2"><strong>TOTAL</strong></td>
                        <td>
                          <strong className={styles.total}>
                            {formatPrice(cartTotal)} CFA
                          </strong>
                        </td>
                      </tr>
                      <tr className={styles.totalWordsRow}>
                        <td colSpan="3" className={styles.totalWordsCell}>
                          <span className={styles.totalWords}>
                            {numberToWordsFR(cartTotal)} francs CFA
                          </span>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.payment}>
              <label>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === PAYMENT_BANK}
                  onChange={() => setPaymentMethod(PAYMENT_BANK)}
                />
                ORANGE Money
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === PAYMENT_CHEQUE}
                  onChange={() => setPaymentMethod(PAYMENT_CHEQUE)}
                />
                MTN Mobile Money
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === PAYMENT_PAYPAL}
                  onChange={() => setPaymentMethod(PAYMENT_PAYPAL)}
                />
                PayPal, Carte bancaire (Visa / MasterCard) via PayPal sécurisé
              </label>
              <p className={styles.paymentHint}>
                {paymentMethod === PAYMENT_CHEQUE
                  ? "Paiement sécurisé via MTN Mobile Money. Un message de confirmation sera envoyé sur votre téléphone."
                  : paymentMethod === PAYMENT_BANK
                  ? "Paiement sécurisé via Orange Money. Un message de confirmation sera envoyé sur votre téléphone."
                  : "Vos paiements par carte sont traités de manière sécurisée sur la page PayPal. Aucune donnée de carte bancaire n'est stockée sur notre site."}
              </p>
            </div>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              J'ai lu et j'accepte les conditions générales de vente
            </label>

            <button
              type="button"
              className={styles.btn}
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing
                ? paymentMethod === PAYMENT_CHEQUE || paymentMethod === PAYMENT_BANK
                  ? "Initialisation du paiement..."
                  : "Redirection..."
                : "Passer la commande"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal MTN Mobile Money */}
      <MTNPaymentModal
        isOpen={mtnModalOpen}
        onClose={() => {
          if (mtnPaymentStatus === MTN_STATUS.SUCCESS) {
            setMtnModalOpen(false);
            router.push("/PaymentSuccess");
          } else if (mtnPaymentStatus === MTN_STATUS.PENDING) {
            // Demander confirmation avant de fermer
            if (window.confirm("Le paiement est en cours. Êtes-vous sûr de vouloir fermer ?")) {
              clearPolling();
              setMtnModalOpen(false);
            }
          } else {
            setMtnModalOpen(false);
          }
        }}
        phoneNumber={billing.phone}
        amount={cartTotal}
        status={mtnPaymentStatus}
        transactionId={mtnTransactionId}
        errorMessage={mtnErrorMessage}
        onRetry={() => {
          setMtnPaymentStatus(MTN_STATUS.PENDING);
          setMtnErrorMessage("");
          if (mtnTransactionId) {
            startPolling(mtnTransactionId);
          } else {
            handlePlaceOrder();
          }
        }}
      />

      {/* Modal Orange Money */}
      <MTNPaymentModal
        isOpen={orangeModalOpen}
        onClose={() => {
          if (orangePaymentStatus === ORANGE_STATUS.SUCCESS) {
            setOrangeModalOpen(false);
            router.push("/PaymentSuccess");
          } else if (orangePaymentStatus === ORANGE_STATUS.PENDING) {
            // Demander confirmation avant de fermer
            if (window.confirm("Le paiement est en cours. Êtes-vous sûr de vouloir fermer ?")) {
              clearOrangePolling();
              setOrangeModalOpen(false);
            }
          } else {
            setOrangeModalOpen(false);
          }
        }}
        phoneNumber={billing.phone}
        amount={cartTotal}
        status={orangePaymentStatus}
        transactionId={orangeTransactionId}
        errorMessage={orangeErrorMessage}
        onRetry={() => {
          setOrangePaymentStatus(ORANGE_STATUS.PENDING);
          setOrangeErrorMessage("");
          if (orangeTransactionId) {
            startOrangePolling(orangeTransactionId);
          } else {
            handlePlaceOrder();
          }
        }}
      />
    </div>
  );
}
