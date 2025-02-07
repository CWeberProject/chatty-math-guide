
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcription, userMessage, chatHistory } = await req.json();

    const messages = [
      {
        role: "system",
        content: "You are a friendly and knowledgeable math tutor. Your goal is to help students understand math concepts and solve problems step by step. Always be encouraging and provide clear, detailed explanations."
      },
      {
        role: "user",
        content: `Here is a math problem in markdown format:\n${transcription}`
      },
      ...chatHistory,
      {
        role: "user",
        content: userMessage
      }
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-math",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    console.log('Groq API Response:', data);

    if (data.choices && data.choices[0]?.message?.content) {
      const tutorResponse = data.choices[0].message.content;
      return new Response(JSON.stringify({ tutorResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Invalid response from Groq API');
    }
  } catch (error) {
    console.error('Error in math-tutor function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
