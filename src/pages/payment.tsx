import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import "~/styles/globals.css";
import styles from "../styles/Payment.module.css";
import buttonStyles from "../styles/Button.module.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Termination from "~/components/Termination";

interface PaymentDetails {
  itemName?: string;
  itemPrice?: number;
  alreadyContributed?: number;
  parentEventId?: number;
  eventName?: string;
  eventPlanner?: string;
  orderId: number;
  imageUrl?: string;
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

  // 1) Capture articleId / eventId from URL once router is ready
  useEffect(() => {
    if (!router.isReady) return;
    if (status !== "authenticated") return;

    const { articleid, eventid } = router.query;
    if (typeof articleid === "string") {
      const num = parseInt(articleid, 10);
      setArticleId(isNaN(num) ? null : num);
    } else {
      setArticleId(null);
    }

    if (typeof eventid === "string") {
      const num = parseInt(eventid, 10);
      setEventId(isNaN(num) ? null : num);
    } else {
      setEventId(null);
    }
  }, [router.isReady, router.query, status]);

  // 2) Fetch details (and poll every 5 seconds) whenever articleId or eventId changes
  const fetchDetails = useCallback(async () => {
    if (articleId !== null) {
      try {
        const res = await fetch(`/api/stripe/details?articleid=${articleId}`);
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to fetch payment details:", errorText);
          return;
        }
        // First capture as `unknown`, then cast to our interface:
        const jsonResult: unknown = await res.json();
        const data = jsonResult as PaymentDetails;
        setDetails(data);

        if (data.itemPrice != null && data.alreadyContributed != null) {
          const rem = data.itemPrice - data.alreadyContributed;
          setRemainingAmount(rem > 0 ? rem : 0);
        } else {
          setRemainingAmount(null);
        }
      } catch (err) {
        console.error("Error in fetchDetails (article):", err);
        setDetails(null);
        setRemainingAmount(null);
      }
    } else if (eventId !== null) {
      try {
        const res = await fetch(`/api/stripe/details?eventid=${eventId}`);
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to fetch event details:", errorText);
          return;
        }
        // Again, two‐step: unknown → typed
        const jsonResult: unknown = await res.json();
        const data = jsonResult as PaymentDetails;
        setDetails(data);
        setRemainingAmount(null);
      } catch (err) {
        console.error("Error in fetchDetails (event):", err);
        setDetails(null);
        setRemainingAmount(null);
      }
    } else {
      setDetails(null);
      setRemainingAmount(null);
    }
  }, [articleId, eventId]);

  useEffect(() => {
    if (articleId === null && eventId === null) {
      return;
    }

    // Fetch once immediately
    void fetchDetails();

    // Poll every 5 seconds
    const intervalId = setInterval(() => {
      void fetchDetails();
    }, 5000);

    // Clear on cleanup / unmount / ID change
    return () => {
      clearInterval(intervalId);
    };
  }, [articleId, eventId, fetchDetails]);

  // 3) Handle “Checkout” button click
  const handleCheckout = async () => {
    if (status !== "authenticated") {
      alert("You must be signed in to proceed.");
      return;
    }
    const userName = session?.user?.name;
    if (!userName) {
      alert("User name is missing.");
      return;
    }
    const purchaserUsername = userName;

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
      console.error("Missing articleId/eventId/details:", {
        articleId,
        eventId,
        details,
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      const payload: {
        userId: string;
        amount: number;
        articleId?: number;
        eventId?: number;
      } = {
        userId: purchaserUsername,
        amount,
        ...(articleId !== null ? { articleId } : { eventId: eventId! }),
      };

      const response = await fetch("/api/stripe/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Two‐step again: capture as `unknown`, then cast to our shape
      const responseJson: unknown = await response.json();
      const dataTyped = responseJson as { url?: string; error?: string };
      const redirectUrl = dataTyped.url;
      const errorMsg = dataTyped.error;

      if (response.ok && redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        alert(errorMsg ?? "Failed to initiate checkout. Please try again.");
        console.error("Stripe Checkout Error:", dataTyped);
      }
    } catch (err) {
      console.error("Network or unexpected error:", err);
      alert("An error occurred while creating the checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // 4) While loading or not authenticated, show a simple “Loading…” state
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

  // Decide which image URL to use:
  // const imgSrc = details.imageUrl ?? "/cake.png";
  const imgSrc =
    details.imageUrl &&
      (details.imageUrl.startsWith("http://") ||
        details.imageUrl.startsWith("https://"))
      ? details.imageUrl
      : "/cake.png";

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.card}>
        {/* ORDER ID (dynamic) */}
        <h2 className={styles.orderId}>Order ID #{details.orderId}</h2>

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
                <strong>Already Contributed:</strong>{" "}
                {details.alreadyContributed} RON
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
          <img
            src={imgSrc}
            alt="Event or Item"
            width={100}
            height={100}
            className={styles.image}
          />
          <div className={styles.eventDetails}>
            {articleId !== null ? (
              <>
                <span>Wish-list Item for Event #{details.parentEventId}</span>
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
            className={`${buttonStyles.button} ${buttonStyles["button-secondary"]}`}
            onClick={router.back}
          >
            ← Back
          </button>

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
      <Termination
        eventId={eventId}
        invitationId={null}
        articleId={articleId}
      />
    </div>
  );
}
