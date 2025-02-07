
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function makeGeminiRequest(base64Image: string, retryCount = 0): Promise<Response> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "You are a math problem transcriber. Convert this math problem into clear markdown format. Include any mathematical notation using LaTeX syntax. Only provide the transcription, no explanations or solutions."
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }]
      })
    });

    // If service is unavailable and we haven't exceeded retries, try again
    if (response.status === 503 && retryCount < 3) {
      console.log(`Retry attempt ${retryCount + 1} after 503 error`);
      // Wait for exponential backoff time before retrying
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      return makeGeminiRequest(base64Image, retryCount + 1);
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Gemini API error (Status ${response.status}):`, errorData);
      
      let userMessage = "An error occurred while processing your image.";
      if (response.status === 503) {
        userMessage = "The service is temporarily unavailable. Please try again in a few moments.";
      }
      
      return new Response(JSON.stringify({ 
        error: userMessage,
        details: `Error: Gemini API returned status ${response.status}: ${errorData}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return response;
  } catch (error) {
    console.error('Network error in Gemini request:', error);
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
    
    console.log('Making request to Gemini API...');
    const response = await makeGeminiRequest(base64Image);
    
    if (!response.ok) {
      return response;
    }

    const data = await response.json();
    console.log('Gemini API Response:', JSON.stringify(data, null, 2));

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected Gemini API response structure:', data);
      return new Response(JSON.stringify({ 
        error: "Invalid response format from the image processing service",
        details: "Invalid response structure from Gemini API"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const transcription = data.candidates[0].content.parts[0].text;
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
