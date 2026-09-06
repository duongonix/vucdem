# Story Reader

When a chapter resolves to `contentFormat: interactive`, the reader renders the branded message timeline rather than text or the full audio player. See `specs/features/interactive-stories.md`.

## Goal

The canonical `/story/{slug}/{chapterNumber}` route presents either authored prose or an authored
Cloudinary audio asset without changing the Story/Chapter relationship.

## Text-to-Speech

Text Chapters, including legacy Chapters without `contentFormat`, expose an optional “Đọc truyện”
control. It uses the browser-native Web Speech API entirely on the client:

- no external TTS service;
- no generated MP3 or other persisted media;
- no Cloudinary, Firebase Storage, Firestore, or microphone access;
- Vietnamese (`vi-VN`) voices are preferred, with graceful browser-default fallback;
- available Vietnamese voices, play/pause/resume/stop/restart, and playback rates
  `0.75× | 1× | 1.25× | 1.5× | 2×` are exposed accessibly;
- rate and voice names may be stored as device-local preferences only;
- long prose is converted to readable plain text and spoken through bounded sentence/paragraph
  chunks; progress represents chunks, never fabricated audio time;
- changing Chapter or leaving the reader cancels the active utterance and removes
  `voiceschanged` listeners;
- unsupported browsers, missing Vietnamese voices, empty content, and synthesis errors degrade to
  concise user-facing states without affecting normal reading.

Changing rate or voice while a chunk is active applies to the next chunk. Restart applies the new
choice immediately from the beginning. Browser voice inventory and quality are device-dependent.

Audio Chapters continue to use the authored Audio Player and never show text-to-speech controls.

## Reader behavior

The reading column remains centered and readable. Reader typography preferences, chapter
navigation, reading progress, quote sharing, and Chapter comments remain available. TTS does not
modify Chapter content or any persistent application document.

Text Chapters render the safe Markdown subset from the stored Chapter `content` string. Raw HTML is
escaped, Markdown image syntax is unsupported, and unsafe links are rejected during authoring and
trusted mutation validation. Plain-text legacy Chapters remain readable as normal paragraphs.

## Accessibility and responsive behavior

Every control has a visible focus state and accessible name. Native buttons/selects support Tab,
Enter, and Space. Mobile stacks controls and selectors without horizontal overflow; the Story text
remains the primary visual content.
