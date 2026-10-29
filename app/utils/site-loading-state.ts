export interface SiteLoadingController {
  stylesReady: Promise<void>
  documentReady: () => void
  appReady: () => void
  sceneReady: () => void
  cancel: () => void
}

declare global {
  interface Window {
    __everglowLoading?: SiteLoadingController
  }
}
