"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../utils/supabaseClient";

export function useGoalMetrics() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return;

    const res = await fetch("/api/goals/metrics", {
      headers: {
        Authorization: `Bearer ${session.session.access_token}`,
      },
    });

    const data = await res.json();
    setGoals(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    goals,
    loading,
    refresh: fetchMetrics, // 👈 IMPORTANT
  };
}
