import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  try {
    const { user_id, title, message } = await req.json();

    console.log("SEND PUSH →", user_id);

    return new Response(
      JSON.stringify({
        success: true,
        sent: true,
        title,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: String(e),
      }),
      {
        status: 500,
      }
    );
  }
});