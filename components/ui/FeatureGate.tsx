import { notFound } from 'next/navigation'

export default function FeatureGate({ enabled, children }: Readonly<{ enabled: boolean; children: React.ReactNode }>) {
  if (!enabled) return notFound()
  return <>{children}</>
}
