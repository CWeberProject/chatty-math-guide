
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function makeGroqRequest(base64Image: string, retryCount = 0): Promise<Response> {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview",
        messages: [
          {
            role: "system",
            content: "You are a math problem transcriber. Convert math problems into clear markdown format. Include any mathematical notation using LaTeX syntax. Only provide the transcription, no explanations or solutions."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please transcribe this math problem into markdown format with LaTeX notation where appropriate:"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Groq API error (Status ${response.status}):`, errorData);
      
      return new Response(JSON.stringify({ 
        error: "An error occurred while processing your image.",
        details: `Error: Groq API returned status ${response.status}: ${errorData}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return response;
  } catch (error) {
    console.error('Network error in Groq request:', error);
    return new Response(JSON.stringify({ 
      error: "Failed to connect to the image processing service. Please try again.",
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      throw new Error('No image provided');
    }

    const base64Image = image.split(',')[1];
    
    console.log('Making request to Groq API...');
    const response = await makeGroqRequest(base64Image);
    
    if (!response.ok) {
      return response;
    }

    const data = await response.json();
    console.log('Groq API Response:', JSON.stringify(data, null, 2));

    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected Groq API response structure:', data);
      return new Response(JSON.stringify({ 
        error: "Invalid response format from the image processing service",
        details: "Invalid response structure from Groq API"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const transcription = data.choices[0].message.content;
    return new Response(JSON.stringify({ transcription }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-math function:', error);
    return new Response(JSON.stringify({ 
      error: "An unexpected error occurred while processing your request",
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
