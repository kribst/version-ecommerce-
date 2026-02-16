 "use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { paypalAPI } from "@/utils/api";
import styles from "./Checkout.module.css";

const PAYMENT_BANK = "bank";
const PAYMENT_CHEQUE = "cheque";
const PAYMENT_PAYPAL = "paypal";

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_PAYPAL);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [paypalReturnProcessed, setPaypalReturnProcessed] = useState(false);

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

    if (paymentMethod === PAYMENT_BANK || paymentMethod === PAYMENT_CHEQUE) {
      setError("Ce mode de paiement n'est pas encore disponible. Veuillez choisir PayPal.");
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
                Carte Visa
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === PAYMENT_CHEQUE}
                  onChange={() => setPaymentMethod(PAYMENT_CHEQUE)}
                />
                Paiement par chèque
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
                Vos paiements par carte sont traités de manière sécurisée sur la page PayPal.
                Aucune donnée de carte bancaire n'est stockée sur notre site.
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
              {placing ? "Redirection..." : "Passer la commande"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
