import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { secret, slug, tag, type } = body;

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  if (tag) {
    revalidateTag(tag);
    return NextResponse.json({ revalidated: true, tag });
  }

  if (type) {
    revalidateTag(`tag-${type}`);
    return NextResponse.json({ revalidated: true, type });
  }

  if (slug) {
    revalidateTag(`page-${slug}`);
    return NextResponse.json({ revalidated: true, slug });
  }

  // No specific target — revalidate everything
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true, all: true });
}
