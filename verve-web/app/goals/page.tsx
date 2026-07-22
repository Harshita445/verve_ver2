"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Skeleton from "@/components/shared/Skeleton";
import {
  getGoals,
  createGoal,
  deleteGoal,
  updateGoal,
  type GoalData,
} from "@/lib/api/client";

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDesc, setNewDesc] = useState("");
  const [newTarget, setNewTarget] = useState(5);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    getGoals()
      .then(setGoals)
      .catch(() => setGoals([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!newDesc.trim()) return;
    setSaving(true);
    try {
      await createGoal({ description: newDesc.trim(), target_sessions: newTarget });
      setNewDesc("");
      setNewTarget(5);
      load();
    } catch {}
    setSaving(false);
  }

  async function handleToggle(goal: GoalData) {
    try {
      await updateGoal(goal.id, { achieved: !goal.achieved });
      load();
    } catch {}
  }

  async function handleDelete(id: string) {
    try {
      await deleteGoal(id);
      load();
    } catch {}
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-content px-6 py-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold">Goals</p>
          <h1 className="font-heading text-4xl font-semibold text-text-primary">Practice Goals</h1>
          <p className="mt-2 text-text-muted">Set and track your communication practice goals.</p>
        </motion.div>

        <div className="mb-10 rounded-card border border-border bg-card p-6 shadow-soft">
          <h2 className="font-heading text-xl font-semibold text-text-primary">New Goal</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              className="flex-1 rounded-lg border border-border bg-elevated p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
              placeholder="What do you want to achieve?"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <input
              type="number"
              className="w-24 rounded-lg border border-border bg-elevated p-3 text-sm text-text-primary text-center focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
              min={1}
              value={newTarget}
              onChange={(e) => setNewTarget(Number(e.target.value))}
              aria-label="Target sessions"
            />
            <button
              onClick={handleCreate}
              disabled={saving || !newDesc.trim()}
              className="inline-flex h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-burgundy-dark transition-all duration-300 hover:shadow-glow disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Goal"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="80px" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="rounded-card border border-dashed border-border p-12 text-center">
            <p className="text-text-muted">No goals yet. Create your first goal above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal, i) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between rounded-card border p-5 transition-colors ${
                  goal.achieved ? "border-success/20 bg-success/5" : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggle(goal)}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                      goal.achieved
                        ? "border-success bg-success text-white"
                        : "border-border hover:border-gold"
                    }`}
                    aria-label={goal.achieved ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {goal.achieved && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 6 5 9 10 3" />
                      </svg>
                    )}
                  </button>
                  <div>
                    <p className={`text-sm font-medium ${goal.achieved ? "text-text-muted line-through" : "text-text-primary"}`}>
                      {goal.description}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {goal.current_progress} / {goal.target_sessions} sessions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-subtle">
                    {Math.round((goal.current_progress / Math.max(goal.target_sessions, 1)) * 100)}%
                  </span>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-xs text-error/60 transition-colors hover:text-error"
                    aria-label={`Delete goal: ${goal.description}`}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
