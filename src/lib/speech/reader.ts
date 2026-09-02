import { browser } from '$app/environment';
import { splitSpeechText } from './text';
import type { SpeechReader, SpeechReaderState } from './types';

const RATE_KEY = 'vucdem:speech:rate';
const VOICE_KEY = 'vucdem:speech:voice';
const RATES = [0.75, 1, 1.25, 1.5, 2] as const;

export function createSpeechReader(
	text: string,
	onState: (state: SpeechReaderState) => void
): SpeechReader {
	const chunks = splitSpeechText(text);
	let utterance: SpeechSynthesisUtterance | null = null;
	let session = 0;
	let initialized = false;
	let state: SpeechReaderState = {
		status: 'idle',
		voices: [],
		selectedVoiceName: '',
		rate: 1,
		currentChunk: 0,
		totalChunks: chunks.length,
		errorMessage: '',
		hasVietnameseVoice: false
	};
	const emit = (change: Partial<SpeechReaderState> = {}) => {
		state = { ...state, ...change };
		onState(state);
	};
	const supported = () =>
		browser && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
	const loadVoices = () => {
		if (!supported()) return;
		const voices = window.speechSynthesis.getVoices();
		const vietnamese = voices.filter((voice) => voice.lang.toLowerCase().startsWith('vi'));
		const saved = localStorage.getItem(VOICE_KEY) ?? '';
		const selected = vietnamese.find((voice) => voice.name === saved) ?? vietnamese[0];
		emit({
			voices: vietnamese,
			selectedVoiceName: selected?.name ?? '',
			hasVietnameseVoice: vietnamese.length > 0
		});
	};
	const speakCurrent = () => {
		if (!supported() || !chunks[state.currentChunk]) return;
		const currentSession = session;
		utterance = new SpeechSynthesisUtterance(chunks[state.currentChunk]);
		utterance.lang = 'vi-VN';
		utterance.rate = state.rate;
		utterance.pitch = 1;
		utterance.voice = state.voices.find((voice) => voice.name === state.selectedVoiceName) ?? null;
		utterance.onend = () => {
			if (currentSession !== session || state.status === 'idle') return;
			if (state.currentChunk + 1 < chunks.length) {
				emit({ currentChunk: state.currentChunk + 1, status: 'playing' });
				speakCurrent();
			} else {
				emit({ status: 'idle', currentChunk: 0 });
			}
		};
		utterance.onerror = (event) => {
			if (currentSession !== session || event.error === 'canceled' || event.error === 'interrupted')
				return;
			emit({ status: 'error', errorMessage: 'Không thể phát giọng đọc trên thiết bị này.' });
		};
		window.speechSynthesis.speak(utterance);
	};
	const stop = () => {
		session += 1;
		if (supported()) window.speechSynthesis.cancel();
		utterance = null;
		emit({ status: supported() ? 'idle' : 'unsupported', currentChunk: 0, errorMessage: '' });
	};
	return {
		initialize() {
			if (initialized) return;
			initialized = true;
			if (!supported()) {
				emit({
					status: 'unsupported',
					errorMessage: 'Trình duyệt của bạn chưa hỗ trợ chức năng đọc truyện.'
				});
				return;
			}
			const savedRate = Number(localStorage.getItem(RATE_KEY));
			if (RATES.includes(savedRate as (typeof RATES)[number])) state.rate = savedRate;
			loadVoices();
			window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
			emit();
		},
		play() {
			if (!supported() || !chunks.length) return;
			if (state.status === 'paused') {
				window.speechSynthesis.resume();
				emit({ status: 'playing' });
				return;
			}
			if (state.status === 'playing') return;
			session += 1;
			window.speechSynthesis.cancel();
			emit({ status: 'playing', errorMessage: '' });
			speakCurrent();
		},
		pause() {
			if (!supported() || state.status !== 'playing') return;
			window.speechSynthesis.pause();
			emit({ status: 'paused' });
		},
		stop,
		restart() {
			stop();
			this.play();
		},
		setRate(rate) {
			if (!RATES.includes(rate as (typeof RATES)[number])) return;
			emit({ rate });
			if (browser) localStorage.setItem(RATE_KEY, String(rate));
		},
		setVoice(name) {
			if (name && !state.voices.some((voice) => voice.name === name)) return;
			emit({ selectedVoiceName: name });
			if (browser) localStorage.setItem(VOICE_KEY, name);
		},
		destroy() {
			if (supported()) {
				window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
				window.speechSynthesis.cancel();
			}
			session += 1;
			utterance = null;
		}
	};
}
