export interface ImportImage {
  id: string
  file: File
  thumbnailUrl: string
  base64?: string
}

export interface CardDraft {
  tempId: string
  word: string
  meaning: string
  example: string
  pronunciation: string
  synonyms: string[]
  sourceImageIndex: number
  isChecked: boolean
  isDuplicate: boolean
  isExpanded: boolean
}

export type ImportStep = "upload" | "extracting" | "review" | "creating"

export type DayTagOption = "auto" | "existing" | "new" | "none"

export interface ImportState {
  step: ImportStep
  images: ImportImage[]
  selectedImageIndex: number
  extractionProgress: { current: number; total: number }
  extractionError: string | null
  cards: CardDraft[]
  deletedCards: CardDraft[]
  fullscreenImageOpen: boolean
  dayTagOption: DayTagOption
  existingDayTag: string
  newDayTag: string
  batchSize: number
  creating: boolean
}

export type ImportAction =
  | { type: "ADD_IMAGES"; images: ImportImage[] }
  | { type: "REMOVE_IMAGE"; id: string }
  | { type: "SELECT_IMAGE"; index: number }
  | { type: "START_EXTRACTION" }
  | { type: "UPDATE_EXTRACTION_PROGRESS"; current: number; total: number }
  | { type: "EXTRACTION_ERROR"; error: string }
  | { type: "EXTRACTION_COMPLETE"; cards: CardDraft[] }
  | { type: "TOGGLE_CARD_CHECK"; tempId: string }
  | { type: "TOGGLE_ALL_CARDS" }
  | { type: "DELETE_CARD"; tempId: string }
  | { type: "UNDO_DELETE" }
  | { type: "TOGGLE_CARD_EXPAND"; tempId: string }
  | { type: "UPDATE_CARD_FIELD"; tempId: string; field: keyof CardDraft; value: string | string[] }
  | { type: "SET_DAY_TAG_OPTION"; option: DayTagOption }
  | { type: "SET_EXISTING_DAY_TAG"; tag: string }
  | { type: "SET_NEW_DAY_TAG"; tag: string }
  | { type: "SET_BATCH_SIZE"; size: number }
  | { type: "SET_CREATING"; creating: boolean }
  | { type: "OPEN_FULLSCREEN" }
  | { type: "CLOSE_FULLSCREEN" }
  | { type: "GO_BACK_TO_UPLOAD" }
