/**
 * Video Tools Module — re-exports the new VideoHub page.
 *
 * This file is the module entry point.
 * Route: /video  (see App.tsx)
 */
export { default, VideoHub } from './pages/VideoHub'

/**
 * Keep backward-compat named export for any code that still
 * imports VideoToolsIndex from this module.
 */
export { VideoHub as VideoToolsIndex } from './pages/VideoHub'
