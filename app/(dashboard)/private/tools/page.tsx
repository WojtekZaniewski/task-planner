import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ToolsHub } from '@/components/tools/tools-hub'

export default async function ToolsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <ToolsHub />
    </div>
  )
}
