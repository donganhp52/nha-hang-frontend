import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag");
  // await revalidation and pass durations so TypeScript overloads match
  await revalidateTag(tag!, { expire: 0 });
  return Response.json({ revalidated: true, now: Date.now() });
}
