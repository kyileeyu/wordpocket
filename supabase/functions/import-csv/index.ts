import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

interface CardRow {
  word: string;
  meaning: string;
  example?: string;
  pronunciation?: string;
  tags?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { deck_id, csv_content } = await req.json();

    if (!deck_id || !csv_content) {
      return new Response(
        JSON.stringify({ error: "deck_id and csv_content are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify deck ownership (RLS handles this, but fail early)
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .select("id")
      .eq("id", deck_id)
      .single();

    if (deckError || !deck) {
      return new Response(
        JSON.stringify({ error: "Deck not found or access denied" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse CSV (header: word, meaning, example, pronunciation, tags)
    const lines = csv_content.trim().split("\n");
    const header = lines[0]
      .split(",")
      .map((h: string) => h.trim().toLowerCase());

    const cards: CardRow[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const row: Record<string, string> = {};
      header.forEach((h: string, idx: number) => {
        row[h] = values[idx]?.trim() ?? "";
      });

      if (!row.word || !row.meaning) {
        errors.push(`Row ${i + 1}: word and meaning are required`);
        continue;
      }

      cards.push({
        word: row.word,
        meaning: row.meaning,
        example: row.example || "",
        pronunciation: row.pronunciation || "",
        tags: row.tags || "",
      });
    }

    // Bulk insert cards
    const insertData = cards.map((card) => ({
      deck_id,
      word: card.word,
      meaning: card.meaning,
      example: card.example,
      pronunciation: card.pronunciation,
      tags: card.tags ? card.tags.split(";").map((t) => t.trim()) : [],
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("cards")
      .insert(insertData)
      .select("id");

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        imported: inserted?.length ?? 0,
        errors,
        total_rows: lines.length - 1,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/** Simple CSV line parser with double-quote escape support */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}
