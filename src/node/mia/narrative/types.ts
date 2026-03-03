/**
 * Narrative Types — Shared types for the narrative API layer
 *
 * Story beats, sessions, and narrative analysis request/response shapes.
 * These match what the mia-vscode extensions expect from the server.
 */

import * as crypto from "crypto"

// --- Story Beats ---

export type BeatType = "commit" | "deploy" | "review" | "chart-complete" | "analysis" | "custom"

export interface StoryBeat {
  id: string
  description: string
  type: BeatType
  sessionId?: string
  context?: Record<string, unknown>
  universeAnnotations?: {
    engineer?: string
    ceremony?: string
    story?: string
  }
  createdAt: string
}

export interface CreateBeatRequest {
  description: string
  type?: BeatType
  sessionId?: string
  context?: Record<string, unknown>
}

// --- Sessions ---

export type SessionPhase = "germination" | "assimilation" | "completion"

export interface NarrativeSession {
  id: string
  intent: string
  phase: SessionPhase
  startedAt: string
  updatedAt: string
  beatCount: number
  active: boolean
}

export interface CreateSessionRequest {
  intent: string
}

// --- STC Charts ---

export interface STCChart {
  id: string
  title: string
  desiredOutcome: string
  currentReality: string
  actions: STCAction[]
  createdAt: string
  updatedAt: string
}

export interface STCAction {
  id: string
  title: string
  completed: boolean
  completedAt?: string
}

export interface CreateChartRequest {
  title?: string
  desiredOutcome: string
  currentReality: string
  actions?: { title: string }[]
}

export interface UpdateChartRequest {
  title?: string
  desiredOutcome?: string
  currentReality?: string
}

// --- Analysis ---

export interface AnalysisRequest {
  text: string
  context?: {
    file?: string
    language?: string
    session?: string
  }
  universes?: ("engineer" | "ceremony" | "story")[]
  depth?: "quick" | "standard" | "deep"
}

// --- Helpers ---

export function generateId(): string {
  return crypto.randomUUID()
}
