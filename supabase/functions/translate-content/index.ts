import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pageKey, contentId } = await req.json();
    
    if (!pageKey || !contentId) {
      console.error('Missing required fields: pageKey or contentId');
      return new Response(
        JSON.stringify({ error: 'pageKey and contentId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Translating content for page: ${pageKey}`);

    const systemPrompt = `You are a professional translator. Translate the following JSON content from Indonesian to English.

IMPORTANT RULES:
1. PRESERVE the exact JSON structure - all keys must remain the same
2. Only translate the STRING VALUES, not the keys
3. DO NOT translate these terms - keep them exactly as is:
   - "Bungkus Indonesia"
   - "PT Bungkus Indonesia"
   - "bungkusin.com"
   - Any URLs or image paths
   - Any email addresses
   - Any phone numbers
4. Translate naturally and professionally for a business website
5. Preserve any HTML tags within text values
6. Keep numbers, dates, and technical terms accurate
7. Return ONLY valid JSON, no markdown code blocks

The content is from a packaging company website. Use appropriate business/industry terminology.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Translate this Indonesian content to English:\n\n${JSON.stringify(contentId, null, 2)}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Translation service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const translatedText = aiResponse.choices?.[0]?.message?.content;
    
    if (!translatedText) {
      console.error('No translation content returned from AI');
      return new Response(
        JSON.stringify({ error: 'No translation returned' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the translated JSON
    let translatedContent;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedText = translatedText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
      }
      cleanedText = cleanedText.trim();
      
      translatedContent = JSON.parse(cleanedText);
      console.log('Successfully parsed translated content');
    } catch (parseError) {
      console.error('Failed to parse translated content:', parseError);
      console.error('Raw response:', translatedText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse translated content', raw: translatedText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Translation completed successfully for page: ${pageKey}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        translatedContent,
        pageKey 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
