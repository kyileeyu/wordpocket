import { serve } from "https://deno.land/std/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, content-type, apikey, x-client-info",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "image (base64) is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const apiKey = Deno.env.get("VISION_API_KEY");
    const apiUrl =
      Deno.env.get("VISION_API_URL") ??
      "https://openrouter.ai/api/v1/chat/completions";
    const model =
      Deno.env.get("VISION_MODEL") ??
      "qwen/qwen-2.5-vl-72b-instruct:free";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "VISION_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const systemPrompt = `You are an OCR assistant that extracts vocabulary from photos of handwritten or printed word lists.
Return ONLY a JSON array. Each element must have these fields:
- "word": the English word
- "meaning": the Korean meaning/definition
- "example": an example sentence if visible (empty string if not)
- "pronunciation": IPA pronunciation if visible (empty string if not)

Rules:
- Extract ALL words visible in the image.
- If the meaning is not in Korean, translate it to Korean.
- Do NOT wrap the JSON in markdown code fences.
- Return [] if no words are found.`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${image}` },
              },
              {
                type: "text",
                text: "이 사진에서 영단어와 뜻을 추출해 JSON 배열로 반환해주세요.",
              },
            ],
          },
        ],
        temperature: 0,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(
        JSON.stringify({ error: `Vision API error: ${err}` }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content ?? "[]";

    // Parse the JSON from the response, stripping markdown fences if present
    let words;
    try {
      const cleaned = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      words = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ error: "Failed to parse Vision API response", raw: content }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ words }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
