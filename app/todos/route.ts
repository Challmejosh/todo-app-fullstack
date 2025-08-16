import { sb } from "@/libs/supabase"


export const GET = async ()=>{
    try {
        const {data,error} = await sb.from("Todos").select('*')
        if(error) return new Response(JSON.stringify(error))
        return new Response(JSON.stringify(data))
    } catch (error) {
        return new Response(JSON.stringify({message:"error try again "}))
    }
}


export async function POST(request: Request) {
  try {
    const { text, completed = false } = await request.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Both 'text' and 'id' are required." }),
        { status: 400 }
      );
    }

    const { data, error } = await sb.from("Todos").insert([{ text, completed }]).select().single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(data), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }
}


