/**
 * Checks whether real Supabase credentials have been configured.
 * Until you set real credentials in .env.local, the app runs in
 * "demo mode" — middleware lets everyone through, auth actions
 * skip Supabase calls, and the onboarding simply redirects.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return (
    !!url &&
    !url.includes("your-project-id") &&
    !!key &&
    !key.includes("your-anon-key")
  )
}
