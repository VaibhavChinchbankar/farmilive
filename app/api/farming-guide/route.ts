import { NextResponse } from 'next/server'

// Simple keyword-based fallback so the feature works without a paid API key.
// Swap this out for the real Anthropic call later once billing is set up.
function fallbackAnswer(question: string): string {
  const q = question.toLowerCase()

  if (q.includes('yellow')) {
    return `Yellowing wheat leaves are commonly caused by nitrogen deficiency or early-stage rust disease. Organic-first: apply well-rotted FYM or a neem-cake soil mix to improve nitrogen availability naturally, and check for rust-colored powdery spots on leaves. Conventional: a split urea top-dress at the next irrigation is the standard ICAR-recommended fix if nitrogen deficiency is confirmed. Always follow the product label and consult your local Krishi Vigyan Kendra (KVK) or agriculture extension officer for exact dosage.`
  }
  if (q.includes('pest') || q.includes('insect') || q.includes('aphid')) {
    return `For common wheat pests like aphids, a neem seed kernel extract (NSKE) spray every 10 days is an effective organic-first deterrent that disrupts feeding without killing beneficial insects. If infestation is severe and beyond threshold, a targeted insecticide may be needed as a last resort. Always follow the product label and consult your local Krishi Vigyan Kendra (KVK) or agriculture extension officer for exact dosage.`
  }
  if (q.includes('water') || q.includes('irrigation')) {
    return `Wheat generally needs irrigation at key stages: crown root initiation (~20-25 days after sowing), tillering, flowering, and grain-filling. Avoid waterlogging, which encourages fungal disease. Always follow the product label and consult your local Krishi Vigyan Kendra (KVK) or agriculture extension officer for exact dosage.`
  }

  return `Thanks for your question. For crop-specific concerns like this, the safest first steps are: (1) check for visible pest or disease signs on the leaves and stem, (2) review your recent irrigation and fertilizer schedule, and (3) compare against the stage-specific tips in this guide. Always follow the product label and consult your local Krishi Vigyan Kendra (KVK) or agriculture extension officer for exact dosage.`
}

export async function POST(req: Request) {
  const { question } = await req.json()

  // Real AI call is commented out below — uncomment once you have Anthropic billing set up.
  /*
  import Anthropic from '@anthropic-ai/sdk'
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: `You are an organic-first farming advisor...`,
    messages: [{ role: 'user', content: question }],
  })
  const answer = msg.content[0].type === 'text' ? msg.content[0].text : ''
  return NextResponse.json({ answer })
  */

  const answer = fallbackAnswer(question || '')
  return NextResponse.json({ answer })
}