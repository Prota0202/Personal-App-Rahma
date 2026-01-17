export const getPushServerUrl = () => {
  return import.meta.env.VITE_PUSH_SERVER_URL || ''
}

export const getPushPublicKey = () => {
  return import.meta.env.VITE_PUSH_PUBLIC_KEY || ''
}

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

export const subscribeToPush = async () => {
  const publicKey = getPushPublicKey()
  if (!publicKey) {
    throw new Error('Missing VITE_PUSH_PUBLIC_KEY')
  }

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  })
  return subscription
}

export const getExistingSubscription = async () => {
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}

export const unsubscribeFromPush = async () => {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (subscription) {
    await subscription.unsubscribe()
  }
}
