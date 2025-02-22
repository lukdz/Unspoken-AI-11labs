'use client'

import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init("phc_P0zmNW1JeorIbK4AMcUts2c3H1ZsozsRxKvZcYnklL5", {
    api_host: 'https://eu.i.posthog.com',
    person_profiles: 'always',
    persistence: 'localStorage',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug()
    }
  })
}

export default posthog
