import { sb } from "@/libs/supabase";
import { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
      JSON.stringify({ message: "Todo deleted successfully", data }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }
}
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Todo 'id' is required to update." }),
        { status: 400 }
      );
    }

    // Parse request body
    const { text, completed } = await request.json();

    if (typeof text !== "string" || text.trim() === "") {
      return new Response(
        JSON.stringify({ error: "'text' must be a non-empty string." }),
        { status: 400 }
      );
    }

    if (typeof completed !== "boolean") {
      return new Response(
        JSON.stringify({ error: "'completed' must be a boolean." }),
        { status: 400 }
      );
    }

    const { data, error } = await sb
      .from("Todos")
      .update({ text, completed })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "Todo updated", data }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }
}