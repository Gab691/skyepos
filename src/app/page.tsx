"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

export default function RootPage() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  // const app = initializeApp(firebaseConfig);
  // const analytics = getAnalytics(app);

  useEffect(() => {
    if (loading) return;
    router.replace(firebaseUser ? "/dashboard" : "/login");
  }, [loading, firebaseUser, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner />
    </div>
  );
}
