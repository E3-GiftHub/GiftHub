"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import styles from "../styles/Payment.module.css";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "~/styles/globals.css";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Local state for the amount the user types in (in RON)
  const [contributionAmount, setContributionAmount] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // State to hold the ID we got from the URL and the type (either "eventArticle" or "event")
  const [idType, setIdType] = useState<"eventArticle" | "event" | null>(null);
  const [idValue, setIdValue] = useState<number | null>(null);

  // When the router is ready, parse ?eventid=… or ?articleid=…
  useEffect(() => {
    if (!router.isReady) return;

    const { eventid, articleid } = router.query;
    if (typeof articleid === "string") {
      setIdType("eventArticle");
      setIdValue(parseInt(articleid, 10));
    } else if (typeof eventid === "string") {
      setIdType("event");
      setIdValue(parseInt(eventid, 10));
    } else {
      setIdType(null);
      setIdValue(null);
    }
  }, [router.isReady, router.query]);

  // Handle the “Checkout” button click
  const handleCheckout = async () => {
    // 1. Validate user is signed in
    if (status !== "authenticated" || !session?.user?.id) {
      alert("You must be signed in to proceed.");
      return;
    }
    const purchaserUsername = session.user.id as string;

    // 2. Validate amount
    const amount = Number(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid contribution amount."); // or “purchase amount”
      return;
    }

    // 3. Validate that we have a valid idType/idValue from the URL
    if (!idType || idValue === null) {
      alert("Cannot proceed: missing event or article ID in the URL.");
      console.error("Missing ID from query:", { idType, idValue });
      return;
    }

    // 4. Determine isContribute based on idType:
    //    - if idType = "eventArticle", isContribute = true (contribution to a wishlist)
    //    - if idType = "event",        isContribute = false (direct purchase to planner)
    const isContribute = idType === "eventArticle";

    setIsCheckingOut(true);

    try {
      // 5. Call our NEW API route (moved to /api/stripe/contribute)
      const response = await fetch("/api/stripe/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: idValue,
          idType,
          amount,
          isContribute,
        }),
      });

      const data = await response.json();
      if (response.ok && data.url) {
        // 6. Redirect the browser to Stripe’s hosted checkout
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to initiate checkout. Please try again.");
        console.error("Stripe Checkout Error:", data);
      }
    } catch (err) {
      console.error("Network or unexpected error:", err);
      alert(
        "An error occurred while creating the checkout. Please check your connection and try again.",
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  // While router or session is loading, we can show a simple “Loading…” state
  if (!router.isReady || status === "loading") {
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
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <label
            htmlFor="contributionAmountInput"
            style={{
              marginRight: "10px",
              display: "block",
              marginBottom: "5px",
            }}
          >
            {idType === "eventArticle"
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
            disabled={isCheckingOut}
          />
        </div>
        <div className={styles.tableHeader}>
          <span>
            {idType === "eventArticle" ? "Contribute to Item" : "Event"}
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
            {idType === "eventArticle" ? (
              <>
                <span>Wish‐list Item for Event #{idValue}</span>
                <span>Event No. {idValue}</span>
              </>
            ) : (
              <>
                <span>Giga Chad Birthday Party</span>
                <span>Event No. {idValue}</span>
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
