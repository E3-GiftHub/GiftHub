"use client";
import React, { useState, useEffect } from "react";

import styles from "../styles/Payment.module.css";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../app/globals.css";

const CURRENT_EVENT_ID = 43858;
const TARGET_ARTICLE_ID = 101;
// --- END: Placeholder Values ---

export default function CheckoutPage() {
  const [contributionAmount, setContributionAmount] = useState("");
  const [progress, setProgress] = useState<{
    total: number;
    goal: number;
  } | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Using the eventId defined above.
  // In a dynamic scenario, you'd get this ID from props, context, or router.
  const eventIdToUse = CURRENT_EVENT_ID;

  useEffect(() => {
    const fetchProgress = async () => {
      if (!eventIdToUse) {
        console.warn("eventId is missing. Cannot fetch progress.");
        setIsLoadingProgress(false);
        setProgress(null);
        return;
      }

      setIsLoadingProgress(true);
      try {
        const res = await fetch(
          `/api/payment/progress?eventId=${eventIdToUse}`,
        );
        if (!res.ok) {
          let errorMsg = `Failed to fetch progress: ${res.status}`;
          try {
            const errorData = await res.json();
            errorMsg = errorData.message || errorMsg;
          } catch (parseError) {
            // Ignore if response is not JSON
          }
          throw new Error(errorMsg);
        }
        const data = await res.json();
        setProgress(data);
      } catch (err) {
        console.error("Error fetching progress:", err);
        setProgress(null); // Set to null to indicate loading failure
      } finally {
        setIsLoadingProgress(false);
      }
    };

    fetchProgress();
  }, [eventIdToUse]); // Re-run if eventIdToUse changes

  const handleCheckout = async () => {
    const amount = Number(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid contribution amount."); // Translated
      return;
    }

    if (!eventIdToUse || !TARGET_ARTICLE_ID) {
      alert(
        "Event or Article information is missing. Checkout cannot proceed.",
      ); // Translated
      console.error("Missing eventId or articleId for checkout:", {
        eventIdToUse,
        TARGET_ARTICLE_ID,
      });
      return;
    }

    setIsCheckingOut(true);
    const endpoint = "/api/payment/contribute";
    const body = {
      amount: amount,
      eventId: eventIdToUse,
      articleId: TARGET_ARTICLE_ID,
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        alert(
          data.message ||
            "Failed to initiate Stripe checkout. Please try again.",
        ); // Translated (fallback)
        console.error("Checkout failed:", data);
      }
    } catch (error) {
      console.error("Checkout request failed:", error);
      alert(
        "An error occurred during processing. Please check your connection and try again.",
      ); // Translated
    } finally {
      setIsCheckingOut(false);
    }
  };

  let progressContent;
  if (isLoadingProgress) {
    progressContent = (
      <p style={{ marginTop: "20px", textAlign: "center" }}>
        Loading progress...
      </p>
    ); // Translated
  } else if (
    progress &&
    typeof progress.total === "number" &&
    typeof progress.goal === "number"
  ) {
    const percentage =
      progress.goal > 0 ? (progress.total / progress.goal) * 100 : 0;
    progressContent = (
      <div style={{ marginTop: "20px" }}>
        <p style={{ marginBottom: "8px", textAlign: "center" }}>
          €{progress.total.toFixed(2)} raised out of €{progress.goal.toFixed(2)}{" "}
          {/* Translated "strânși din" to "raised out of" */}
        </p>
        <div
          style={{
            width: "100%",
            backgroundColor: "#4A4A4A",
            borderRadius: "8px",
            overflow: "hidden",
            height: "20px",
          }}
        >
          <div
            style={{
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: "#8a2be2",
              height: "100%",
              transition: "width 0.5s ease-in-out",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "12px",
            }}
          >
            {/* {percentage > 5 && `${percentage.toFixed(0)}%`} */}
          </div>
        </div>
      </div>
    );
  } else {
    progressContent = (
      <p style={{ marginTop: "20px", textAlign: "center", color: "orange" }}>
        Progress information could not be loaded.
      </p>
    ); // Translated
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.card}>
        <h2 className={styles.orderId}>Order id #14385683458738543</h2>{" "}
        {/* Already in English */}
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <label
            htmlFor="contributionAmountInput"
            style={{
              marginRight: "10px",
              display: "block",
              marginBottom: "5px",
            }}
          >
            Contribution Amount (EUR): {/* Translated */}
          </label>
          <input
            id="contributionAmountInput"
            type="number"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            placeholder="Enter amount" // Translated
            className={styles.contributionInput}
            min="1"
            disabled={isCheckingOut}
          />
        </div>
        <div className={styles.tableHeader}>
          <span>Event</span> {/* Translated */}
          <span>Contribution Amount</span> {/* Translated */}
        </div>
        <div className={styles.eventRowAlt}>
          <Image
            src="/cake.png"
            alt="Birthday Cake"
            width={100}
            height={100}
            className={styles.image}
          />
          <div className={styles.eventDetails}>
            <span>Giga Chad Birthday Party</span> {/* Kept as a proper name */}
            <span>Event No. {eventIdToUse}</span>{" "}
            {/* Translated "Eveniment Nr." to "Event No." */}
          </div>
          <span className={styles.amountAlt}>100 lei/euro</span>{" "}
          {/* Kept as specific data display */}
        </div>
        {progressContent}
        <div className={styles.checkoutBtnWrapper}>
          <button
            className={styles.checkoutBtn}
            onClick={handleCheckout}
            disabled={isCheckingOut || isLoadingProgress}
          >
            {isCheckingOut ? "Processing..." : "CHECKOUT"}{" "}
            {/* Translated "Se procesează..." */}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
