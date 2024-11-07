/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLASSIFICATION_SERVICE_URL: string
  readonly VITE_MATCHING_SERVICE_URL: string
  readonly VITE_PARSING_SERVICE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
