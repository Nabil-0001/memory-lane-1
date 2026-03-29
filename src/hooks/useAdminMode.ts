"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getIdTokenResult,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_KEY_SEQUENCE = "aaa";
const KEY_TIMEOUT = 1000;

function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";

  if (code.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }

  if (
    code.includes("invalid-credential") ||
    code.includes("wrong-password") ||
    code.includes("user-not-found")
  ) {
    return "Invalid email or password.";
  }

  if (code.includes("too-many-requests")) {
    return "Too many attempts. Please try again later.";
  }

  return "Unable to sign in right now. Please try again.";
}

export function useAdminMode() {
  const { user, loading } = useAuth();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [keySequence, setKeySequence] = useState("");

  useEffect(() => {
    let isCancelled = false;

    if (loading) {
      return;
    }

    if (!user) {
      queueMicrotask(() => {
        if (!isCancelled) {
          setIsAdminMode(false);
        }
      });

      return () => {
        isCancelled = true;
      };
    }

    void (async () => {
      try {
        const tokenResult = await getIdTokenResult(user);

        if (!isCancelled) {
          setIsAdminMode(tokenResult.claims.admin === true);
        }
      } catch {
        if (!isCancelled) {
          setIsAdminMode(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [loading, user]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const newSequence = keySequence + e.key.toLowerCase();
      setKeySequence(newSequence);

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setKeySequence(""), KEY_TIMEOUT);

      if (newSequence.endsWith(ADMIN_KEY_SEQUENCE)) {
        setShowAdminPanel(true);
        setKeySequence("");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      clearTimeout(timeoutId);
    };
  }, [keySequence]);

  const toggleAdminPanel = useCallback(() => {
    setShowAdminPanel((prev) => !prev);
  }, []);

  const closeAdminPanel = useCallback(() => {
    setShowAdminPanel(false);
  }, []);

  const authenticateAdmin = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      try {
        const credentials = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const tokenResult = await getIdTokenResult(credentials.user, true);

        if (tokenResult.claims.admin !== true) {
          await signOut(auth);
          return "This account does not have admin access.";
        }

        setIsAdminMode(true);
        return null;
      } catch (error) {
        return getAuthErrorMessage(error);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await signOut(auth);
    setIsAdminMode(false);
    setShowAdminPanel(false);
  }, []);

  return {
    isAdminMode,
    showAdminPanel,
    toggleAdminPanel,
    closeAdminPanel,
    authenticateAdmin,
    logout,
  };
}
