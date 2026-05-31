import webPush from 'web-push'

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(
    'mailto:push@baker.app',
    vapidPublicKey,
    vapidPrivateKey
  )
}

export { webPush }
