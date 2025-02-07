
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

    console.log('Sending request to Groq API with messages:', JSON.stringify(messages, null, 2));

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-r1-distill-llama-70b",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      throw new Error(`Groq API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Groq API Response:', JSON.stringify(data, null, 2));

    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected response structure:', data);
      throw new Error('Invalid response structure from Groq API');
    }

    let tutorResponse = data.choices[0].message.content;
    
    // Split at </think> and take only the part after it
    const parts = tutorResponse.split('</think>');
    if (parts.length > 1) {
      tutorResponse = parts[parts.length - 1].trim();
    }

    console.log('Processed tutor response:', tutorResponse);

    return new Response(JSON.stringify({ tutorResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in math-tutor function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
