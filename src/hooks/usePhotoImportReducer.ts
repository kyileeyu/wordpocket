import { useReducer } from "react"
import type { ImportState, ImportAction } from "@/types/photo-import"

const MAX_IMAGES = 20

export const initialState: ImportState = {
  step: "upload",
  images: [],
  selectedImageIndex: 0,
  extractionProgress: { current: 0, total: 0 },
  extractionError: null,
  cards: [],
  deletedCards: [],
  fullscreenImageOpen: false,
  dayTagOption: "none",
  existingDayTag: "",
  newDayTag: "",
  batchSize: 30,
  creating: false,
}

function reducer(state: ImportState, action: ImportAction): ImportState {
  switch (action.type) {
    case "ADD_IMAGES": {
      const remaining = MAX_IMAGES - state.images.length
      const toAdd = action.images.slice(0, remaining)
      return {
        ...state,
        images: [...state.images, ...toAdd],
        selectedImageIndex: state.images.length === 0 ? 0 : state.selectedImageIndex,
      }
    }

    case "REMOVE_IMAGE": {
      const newImages = state.images.filter((img) => img.id !== action.id)
      let newIndex = state.selectedImageIndex
      if (newIndex >= newImages.length) {
        newIndex = Math.max(0, newImages.length - 1)
      }
      return { ...state, images: newImages, selectedImageIndex: newIndex }
    }

    case "SELECT_IMAGE":
      return { ...state, selectedImageIndex: action.index }

    case "START_EXTRACTION":
      return {
        ...state,
        step: "extracting",
        extractionProgress: { current: 0, total: state.images.length },
        extractionError: null,
        cards: [],
      }

    case "UPDATE_EXTRACTION_PROGRESS":
      return {
        ...state,
        extractionProgress: { current: action.current, total: action.total },
      }

    case "EXTRACTION_ERROR":
      return { ...state, extractionError: action.error }

    case "EXTRACTION_COMPLETE":
      return {
        ...state,
        step: "review",
        cards: action.cards,
        deletedCards: [],
      }

    case "TOGGLE_CARD_CHECK": {
      const cards = state.cards.map((c) =>
        c.tempId === action.tempId ? { ...c, isChecked: !c.isChecked } : c
      )
      return { ...state, cards }
    }

    case "TOGGLE_ALL_CARDS": {
      const nonDupCards = state.cards.filter((c) => !c.isDuplicate)
      const allChecked = nonDupCards.every((c) => c.isChecked)
      const cards = state.cards.map((c) =>
        c.isDuplicate ? c : { ...c, isChecked: !allChecked }
      )
      return { ...state, cards }
    }

    case "DELETE_CARD": {
      const card = state.cards.find((c) => c.tempId === action.tempId)
      if (!card) return state
      return {
        ...state,
        cards: state.cards.filter((c) => c.tempId !== action.tempId),
        deletedCards: [card, ...state.deletedCards],
      }
    }

    case "UNDO_DELETE": {
      if (state.deletedCards.length === 0) return state
      const [restored, ...rest] = state.deletedCards
      return {
        ...state,
        cards: [...state.cards, restored],
        deletedCards: rest,
      }
    }

    case "TOGGLE_CARD_EXPAND": {
      const cards = state.cards.map((c) =>
        c.tempId === action.tempId
          ? { ...c, isExpanded: !c.isExpanded }
          : { ...c, isExpanded: false }
      )
      return { ...state, cards }
    }

    case "UPDATE_CARD_FIELD": {
      const cards = state.cards.map((c) =>
        c.tempId === action.tempId ? { ...c, [action.field]: action.value } : c
      )
      return { ...state, cards }
    }

    case "SET_DAY_TAG_OPTION":
      return { ...state, dayTagOption: action.option }

    case "SET_EXISTING_DAY_TAG":
      return { ...state, existingDayTag: action.tag }

    case "SET_NEW_DAY_TAG":
      return { ...state, newDayTag: action.tag }

    case "SET_BATCH_SIZE":
      return { ...state, batchSize: action.size }

    case "SET_CREATING":
      return { ...state, creating: action.creating }

    case "OPEN_FULLSCREEN":
      return { ...state, fullscreenImageOpen: true }

    case "CLOSE_FULLSCREEN":
      return { ...state, fullscreenImageOpen: false }

    case "GO_BACK_TO_UPLOAD":
      return {
        ...state,
        step: "upload",
        extractionProgress: { current: 0, total: 0 },
        extractionError: null,
        cards: [],
        deletedCards: [],
      }

    default:
      return state
  }
}

export function usePhotoImportReducer() {
  return useReducer(reducer, initialState)
}
