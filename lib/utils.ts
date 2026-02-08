import { UIMessagePart } from "ai"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 } from "uuid"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUUID(): string {
  return v4()
}

export function extractUserText(parts?: UIMessagePart<any, any>[]): string {
  if (!parts) return ""
  const texts = parts.filter((part: any) => part?.type === "text" && typeof part?.text === "string").map((part: any) => part.text)
  return texts.join("").trim()
}