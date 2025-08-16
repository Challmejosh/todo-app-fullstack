import { sb } from "@/libs/supabase";
// PATCH handler
export async function PATCH(
  request: Request,
 { params }: { params: Promise<{ id: string }> }
) {
  try {
    // if(!request.url) return new Response(JSON.stringify({message:"api url not found"}))
    // const { searchParams } = new URL(request.url||String(process.env.BACKEND_API));
    // const id = searchParams.get('id');
    const { id } = await params
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Todo 'id' is required to update." }),
        { status: 400 }
      );
    }
    const body = await request.json();
    const { text, completed } = body;
    const { data, error } = await sb
      .from("Todos")
      .update({ text, completed })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to update todo" }),
      { status: 500 }
    );
  }
}

// GET handler
export async function GET(
  request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    // if(!request.url) return new Response(JSON.stringify({message:"api url not found"}))
    // const { searchParams } = new URL(request.url||String(process.env.BACKEND_API));
    // const id = searchParams.get('id');
    const { id } = await params
    if (!id) {
      return new Response(JSON.stringify({ error: "Todo 'id' is required to fetch." }), { status: 400 });
    }
    const { data, error } = await sb.from("Todos").select().eq("id", id).single();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
  }
}

// DELETE handler
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // if(!request.url) return new Response(JSON.stringify({message:"api url not found"}))
    // const { searchParams } = new URL(request.url||String(process.env.BACKEND_API));
    // const id = searchParams.get('id');
    const { id } = await params
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Todo 'id' is required to delete." }),
        { status: 400 }
      );
    }
    const { data, error } = await sb.from("Todos").delete().eq("id", id);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to delete todo" }),
      { status: 500 }
    );
  }
}