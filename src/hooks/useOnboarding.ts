import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { useAvailability } from "./useAvailability";
import { useServices } from "./useServices";

export interface OnboardingState {
  hasAddedService: boolean;
  hasSetAvailability: boolean;
  hasSharedLink: boolean;
  isDismissed: boolean;
}

export function useOnboarding() {
  const { user } = useAuth();
  const { services } = useServices();
  const { availability } = useAvailability();
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasSharedLink, setHasSharedLink] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if owner has added at least one service
  const hasAddedService = services.length > 0;

  // Check if owner has set availability for at least one day
  const hasSetAvailability = availability
    ? Object.entries(availability)
        .filter(([key]) =>
          [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ].includes(key),
        )
        .some(([_, value]: [string, any]) => value?.isOpen === true)
    : false;

  // All steps complete
  const isComplete = hasAddedService && hasSetAvailability && hasSharedLink;

  // Load persisted onboarding state from Firestore
  useEffect(() => {
    async function loadOnboardingState() {
      if (!user) return;
      setIsLoading(true);
      try {
        const docRef = doc(db, "onboarding", user.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setIsDismissed(data.isDismissed || false);
          setHasSharedLink(data.hasSharedLink || false);
        }
      } catch (error) {
        console.error("Error loading onboarding state:", error);
      }
      setIsLoading(false);
    }
    loadOnboardingState();
  }, [user]);

  // Auto-dismiss when all steps complete
  useEffect(() => {
    if (isComplete && !isDismissed && !isLoading) {
      handleDismiss();
    }
  }, [isComplete, isDismissed, isLoading]);

  const markLinkShared = async () => {
    if (!user) return;
    setHasSharedLink(true);
    try {
      await setDoc(
        doc(db, "onboarding", user.uid),
        {
          hasSharedLink: true,
          isDismissed,
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Error saving onboarding state:", error);
    }
  };

  const handleDismiss = async () => {
    if (!user) return;
    setIsDismissed(true);
    try {
      await setDoc(
        doc(db, "onboarding", user.uid),
        {
          isDismissed: true,
          hasSharedLink,
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Error dismissing onboarding:", error);
    }
  };

  const showOnboarding = !isDismissed && !isLoading;

  return {
    hasAddedService,
    hasSetAvailability,
    hasSharedLink,
    isComplete,
    isDismissed,
    showOnboarding,
    markLinkShared,
    handleDismiss,
  };
}
