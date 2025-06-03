"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import styles from "../styles/Payment.module.css";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "~/styles/globals.css";

interface PaymentDetails {
  itemName?: string;
  itemPrice?: number;
  alreadyContributed?: number;
  parentEventId?: number;
  eventName?: string;
  eventPlanner?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [contributionAmount, setContributionAmount] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [articleId, setArticleId] = useState<number | null>(null);
  const [eventId, setEventId] = useState<number | null>(null);

  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [remainingAmount, setRemainingAmount] = useState<number | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (status !== "authenticated") return;
    const { articleid, eventid } = router.query;

    if (typeof articleid === "string") {
      setArticleId(parseInt(articleid, 10));
    } else {
      setArticleId(null);
    }

    if (typeof eventid === "string") {
      setEventId(parseInt(eventid, 10));
    } else {
      setEventId(null);
    }
  }, [router.isReady, router.query, status]);

  useEffect(() => {
    if (articleId !== null) {
      fetch(`/api/stripe/details?articleid=${articleId}`)
        .then(async (res) => {
          if (!res.ok) {
            const error = await res.text();
            console.error("Failed to fetch payment details:", error);
            throw new Error(error || "Unknown error");
          }
          return res.json() as Promise<PaymentDetails>;
        })
        .then((data) => {
          setDetails(data);

          if (
            data.itemPrice != null &&
            data.alreadyContributed != null
          ) {
            const rem = data.itemPrice - data.alreadyContributed;
            setRemainingAmount(rem > 0 ? rem : 0);
          } else {
            setRemainingAmount(null);
          }
        })
        .catch((err) => {
          console.error(err);
          setDetails(null);
          setRemainingAmount(null);
        });
    } else if (eventId !== null) {
      fetch(`/api/stripe/details?eventid=${eventId}`)
        .then(async (res) => {
          if (!res.ok) {
            const error = await res.text();
            console.error("Failed to fetch event details:", error);
            throw new Error(error || "Unknown error");
          }
          return res.json() as Promise<PaymentDetails>;
        })
        .then((data) => {
          setDetails(data);
          setRemainingAmount(null);
        })
        .catch((err) => {
          console.error(err);
          setDetails(null);
          setRemainingAmount(null);
        });
    } else {
      setDetails(null);
      setRemainingAmount(null);
    }
  }, [articleId, eventId]);

  const handleCheckout = async () => {
    if (status !== "authenticated" || !session?.user?.name) {
      alert("You must be signed in to proceed.");
      return;
    }
    const purchaserUsername = session.user.name as string;

    const amount = Number(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (articleId !== null && remainingAmount !== null) {
      if (amount > remainingAmount) {
        alert(`You can only contribute up to ${remainingAmount} RON.`);
        return;
      }
    }

    if ((articleId === null && eventId === null) || !details) {
      alert("Cannot proceed: missing or invalid payment details.");
      console.error("Missing articleId/eventId/details:", { articleId, eventId, details });
      return;
    }

    setIsCheckingOut(true);

    try {
      const body: any = {
        userId: purchaserUsername,
        amount,
      };
      if (articleId !== null) {
        body.articleId = articleId;
      } else {
        body.eventId = eventId!;
      }

      const response = await fetch("/api/stripe/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to initiate checkout. Please try again.");
        console.error("Stripe Checkout Error:", data);
      }
    } catch (err) {
      console.error("Network or unexpected error:", err);
      alert("An error occurred while creating the checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!router.isReady || status === "loading" || details === null) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.card}>
          <p>Loading…</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.card}>
        <h2 className={styles.orderId}>Order id #14385683458738543</h2>

        {articleId !== null ? (
          <>
            <div style={{ marginBottom: "20px" }}>
              <p>
                <strong>Event:</strong> {details.eventName}
              </p>
              <p>
                <strong>Planner:</strong> {details.eventPlanner}
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p>
                <strong>Item:</strong> {details.itemName}
              </p>
              <p>
                <strong>Original Price:</strong> {details.itemPrice} RON
              </p>
              <p>
                <strong>Already Contributed:</strong> {details.alreadyContributed} RON
              </p>
              <p>
                <strong>Remaining to Contribute:</strong> {remainingAmount} RON
              </p>
            </div>
          </>
        ) : (
          <div style={{ marginBottom: "20px" }}>
            <p>
              <strong>Event:</strong> {details.eventName}
            </p>
            <p>
              <strong>Planner:</strong> {details.eventPlanner}
            </p>
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="contributionAmountInput"
            style={{
              marginRight: "10px",
              display: "block",
              marginBottom: "5px",
            }}
          >
            {articleId !== null
              ? "Contribution Amount (RON):"
              : "Purchase Amount (RON):"}
          </label>
          <input
            id="contributionAmountInput"
            type="number"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            placeholder="Enter amount"
            className={styles.contributionInput}
            min="1"
            {...(articleId !== null && remainingAmount !== null
              ? { max: remainingAmount }
              : {})}
            disabled={isCheckingOut}
          />
        </div>

        <div className={styles.tableHeader}>
          <span>
            {articleId !== null ? "Contribute to Item" : "Purchase Event"}
          </span>
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
            {articleId !== null ? (
              <>
                <span>Wish‐list Item for Event #{details.parentEventId}</span>
                <span>Item: {details.itemName}</span>
              </>
            ) : (
              <>
                <span>{details.eventName}</span>
                <span>Planner: {details.eventPlanner}</span>
              </>
            )}
          </div>
        </div>

        <div className={styles.checkoutBtnWrapper}>
          <button
            className={styles.checkoutBtn}
            onClick={handleCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? "Processing…" : "CHECKOUT"}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
