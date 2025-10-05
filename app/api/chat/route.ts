import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 500 });
    }

    const { message, context } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const system = [
      "You are an expert assistant for an asteroid risk visualization and simulation app (Impactor-2025).",
      "Understand natural language and answer even without per-asteroid context.",
      "Style: concise, clear, prefer bullet points. Avoid long paragraphs.",
      "If asteroid context is provided, use it: size/diameter, velocity, orbit class, hazard flags, close-approach distances. Cite numbers when helpful.",
      "Input may include a JSON blob prefixed by 'Context:'. If context.full exists, it contains the full CSV-derived object. Use it to ground answers.",
      "If the question is general, answer generally first, then add an 'In our app' note mapping to app features (orbits, impact energy → TNT/crater, mitigation: civil defense, gravity tractor, kinetic impact, nuclear; USGS layers for tsunami/seismic/topography; time-aware orbits; scenario exploration).",
      "Keep responses safe, accurate, and user-friendly. and concise.",
      "If you don't know the answer, say so. Never make up an answer.",
      "Always refer to asteroids as 'asteroids', never 'asteroid objects' or 'NEOs'.",
      "If the user asks for a list, limit to 3-5 items max.",
      "Use metric units primarily, with optional imperial in parentheses.",
      "If the user asks about impact effects, mention airburst vs ground impact, and reference the USGS layers for tsunami/seismic/topography.",
      "If the user asks about mitigation, mention civil defense, gravity tractor, kinetic impact, nuclear options.",
    ].join(" ");

    const userContent = [
      context ? `Context: ${safeStringify(context)}` : "",
      `User: ${message}`
    ]
      .filter(Boolean)
      .join("\n\n");

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userContent }
        ],
        temperature: 0.2,
        stream: false
      })
    });

    if (!groqRes.ok) {
      const text = await groqRes.text();
      return NextResponse.json({ error: `Groq error: ${text}` }, { status: groqRes.status });
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unexpected error" }, { status: 500 });
  }
}

function safeStringify(value: unknown) {
  try {
    return typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    return "";
  }
}
