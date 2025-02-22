'use client'

import posthog from '@/lib/posthog'
import { PostHogProvider } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function PostHogPageview(): JSX.Element {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams?.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [pathname, searchParams])

  return <></>
}

export function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PostHogProvider client={posthog}>
      <PostHogPageview />
      {children}
    </PostHogProvider>
  )
}
