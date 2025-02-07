
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
        content: `You are a supportive math tutor who guides students to solve problems on their own rather than providing complete solutions. Your approach should:

1. Ask probing questions to understand their thinking
2. Provide small hints and tips that lead them in the right direction
3. Break down complex problems into smaller, manageable steps
4. Encourage critical thinking by asking "What do you think the next step might be?"
5. Validate their correct thinking and gently redirect misconceptions
6. Use the Socratic method to help students discover solutions themselves
7. Only provide more direct help if the student is truly stuck after multiple attempts

Never solve the problem entirely for them. Instead, help them develop problem-solving skills through guided discovery.

Important: Your response should always be structured as follows:
1. <think>Your analysis of the student's current understanding and what guidance they need</think>
2. Your actual response to the student, focusing on the next small step they should take

When writing mathematical expressions, use LaTeX notation with $ for inline math and $$ for display math.`
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
