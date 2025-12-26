import React, { createContext, useContext, useState, useEffect } from 'react'

const BookmarksContext = createContext()

export const useBookmarks = () => {
  const context = useContext(BookmarksContext)
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarksProvider')
  }
  return context
}

export const BookmarksProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('bookmarks')
    return saved ? JSON.parse(saved) : { verses: [], duas: [] }
  })

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  const addVerse = (verse) => {
    const newBookmarks = {
      ...bookmarks,
      verses: [...bookmarks.verses.filter(v => v.id !== verse.id), verse]
    }
    setBookmarks(newBookmarks)
  }

  const removeVerse = (verseId) => {
    const newBookmarks = {
      ...bookmarks,
      verses: bookmarks.verses.filter(v => v.id !== verseId)
    }
    setBookmarks(newBookmarks)
  }

  const addDua = (dua) => {
    const newBookmarks = {
      ...bookmarks,
      duas: [...bookmarks.duas.filter(d => d.id !== dua.id), dua]
    }
    setBookmarks(newBookmarks)
  }

  const removeDua = (duaId) => {
    const newBookmarks = {
      ...bookmarks,
      duas: bookmarks.duas.filter(d => d.id !== duaId)
    }
    setBookmarks(newBookmarks)
  }

  const isVerseBookmarked = (verseId) => {
    return bookmarks.verses.some(v => v.id === verseId)
  }

  const isDuaBookmarked = (duaId) => {
    return bookmarks.duas.some(d => d.id === duaId)
  }

  return (
    <BookmarksContext.Provider value={{
      bookmarks,
      addVerse,
      removeVerse,
      addDua,
      removeDua,
      isVerseBookmarked,
      isDuaBookmarked
    }}>
      {children}
    </BookmarksContext.Provider>
  )
}

