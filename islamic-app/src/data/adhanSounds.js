const adhanSounds = [
  {
    id: 'mishary-alafasy',
    label: 'Mishari Alafasy',
    src: '/audio/adhan-mishary-alafasy.mp3',
  },
]

export const getAdhanSoundById = (id) => {
  return adhanSounds.find((sound) => sound.id === id) || adhanSounds[0]
}

export default adhanSounds
