import { GoogleTagManager, GoogleTagManagerNoScript } from './google-tag-manager'

export function GTM() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID

  if (!gtmId) {
    return null
  }

  return (
    <>
      <GoogleTagManager gtmId={gtmId} />
      <GoogleTagManagerNoScript gtmId={gtmId} />
    </>
  )
}