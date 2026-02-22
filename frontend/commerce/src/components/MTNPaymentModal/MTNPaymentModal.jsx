"use client";

import React, { useEffect } from "react";
import styles from "./MTNPaymentModal.module.css";

const PAYMENT_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

export default function MTNPaymentModal({
  isOpen,
  onClose,
  phoneNumber,
  amount,
  status,
  transactionId,
  errorMessage,
  onRetry,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPhone = (phone) => {
    if (!phone) return "";
    // Formater le numéro pour l'affichage
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("237")) {
      return `+237 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
    return phone;
  };

  const formatAmount = (amt) => {
    return Math.round(amt).toLocaleString("fr-FR");
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Fermer">
          ×
        </button>

        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <div className={styles.mtnLogo}>MTN</div>
          </div>
          <h2 className={styles.title}>Paiement MTN Mobile Money</h2>
        </div>

        <div className={styles.content}>
          {status === PAYMENT_STATUS.PENDING && (
            <div className={styles.pendingState}>
              <div className={styles.spinner}></div>
              <h3 className={styles.statusTitle}>En attente de paiement</h3>
              <p className={styles.instruction}>
                Un message de confirmation a été envoyé au numéro{" "}
                <strong>{formatPhone(phoneNumber)}</strong>
              </p>
              <p className={styles.instruction}>
                Veuillez valider le paiement de <strong>{formatAmount(amount)} CFA</strong> sur
                votre téléphone.
              </p>
              <div className={styles.transactionInfo}>
                <p className={styles.transactionId}>
                  Transaction ID: <span>{transactionId || "En cours..."}</span>
                </p>
              </div>
              <div className={styles.warningBox}>
                <p className={styles.warningText}>
                  ⚠️ Ne fermez pas cette page. Le paiement sera vérifié automatiquement.
                </p>
              </div>
            </div>
          )}

          {status === PAYMENT_STATUS.SUCCESS && (
            <div className={styles.successState}>
              <div className={styles.successIcon}>✓</div>
              <h3 className={styles.statusTitle}>Paiement réussi !</h3>
              <p className={styles.successMessage}>
                Votre paiement de <strong>{formatAmount(amount)} CFA</strong> a été confirmé avec
                succès.
              </p>
              {transactionId && (
                <p className={styles.transactionId}>
                  Transaction ID: <span>{transactionId}</span>
                </p>
              )}
            </div>
          )}

          {status === PAYMENT_STATUS.FAILED && (
            <div className={styles.failedState}>
              <div className={styles.failedIcon}>✗</div>
              <h3 className={styles.statusTitle}>Paiement échoué</h3>
              <p className={styles.errorMessage}>
                {errorMessage ||
                  "Le paiement n'a pas pu être effectué. Veuillez réessayer."}
              </p>
              {onRetry && (
                <button className={styles.retryButton} onClick={onRetry}>
                  Réessayer
                </button>
              )}
            </div>
          )}

          {status === PAYMENT_STATUS.CANCELLED && (
            <div className={styles.cancelledState}>
              <div className={styles.cancelledIcon}>⚠</div>
              <h3 className={styles.statusTitle}>Paiement annulé</h3>
              <p className={styles.cancelledMessage}>
                Le paiement a été annulé. Vous pouvez réessayer plus tard.
              </p>
            </div>
          )}
        </div>

        {(status === PAYMENT_STATUS.SUCCESS ||
          status === PAYMENT_STATUS.FAILED ||
          status === PAYMENT_STATUS.CANCELLED) && (
          <div className={styles.footer}>
            <button className={styles.closeModalButton} onClick={onClose}>
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
