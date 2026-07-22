"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "requesting" | "denied" | "ready" | "recording" | "paused" | "stopped" | "error";

export type AudioRecorder = {
  state: RecorderState;
  elapsedMs: number;
  audioBlob: Blob | null;
  analyserNode: AnalyserNode | null;
  frequencyData: Uint8Array | null;
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  requestPermission: () => Promise<void>;
  errorMessage: string | null;
};

const BAR_COUNT = 64;

export function useAudioRecorder(): AudioRecorder {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateFrequencyData = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const downsampled = new Uint8Array(BAR_COUNT);
    const step = Math.floor(data.length / BAR_COUNT);
    for (let i = 0; i < BAR_COUNT; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += data[i * step + j] || 0;
      }
      downsampled[i] = Math.min(255, Math.round(sum / step));
    }
    setFrequencyData(downsampled);
    if (mediaRecorderRef.current?.state === "recording") {
      rafRef.current = requestAnimationFrame(updateFrequencyData);
    }
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - pausedAtRef.current;
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    cancelAnimationFrame(rafRef.current);
  }, []);

  const cleanupMedia = useCallback(() => {
    stopTimer();
    cancelAnimationFrame(rafRef.current);
    sourceRef.current?.disconnect();
    audioContextRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    mediaRecorderRef.current = null;
    sourceRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    setAnalyserNode(null);
    setFrequencyData(null);
  }, [stopTimer]);

  const requestPermission = useCallback(async () => {
    setState("requesting");
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setState("ready");
    } catch (err) {
      setState("denied");
      setErrorMessage(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone access denied. Please allow microphone access in your browser settings."
          : "Could not access microphone."
      );
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = streamRef.current || (await navigator.mediaDevices.getUserMedia({ audio: true }));
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      sourceRef.current = source;
      analyserRef.current = analyser;
      setAnalyserNode(analyser);

      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4" });
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setAudioBlob(blob);
      };

      recorder.onerror = () => {
        setState("error");
        setErrorMessage("Recording encountered an error.");
        cleanupMedia();
      };

      recorder.start(100);
      pausedAtRef.current = 0;
      setState("recording");
      startTimer();
      updateFrequencyData();
    } catch (err) {
      setState("error");
      setErrorMessage("Could not start recording.");
    }
  }, [cleanupMedia, startTimer, updateFrequencyData]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      pausedAtRef.current = Date.now() - startTimeRef.current;
      stopTimer();
      setState("paused");
    }
  }, [stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      startTimer();
      updateFrequencyData();
      setState("recording");
    }
  }, [startTimer, updateFrequencyData]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused")) {
      mediaRecorderRef.current.stop();
    }
    stopTimer();
    cancelAnimationFrame(rafRef.current);
    setState("stopped");
  }, [stopTimer]);

  useEffect(() => {
    return () => {
      cleanupMedia();
    };
  }, [cleanupMedia]);

  return {
    state,
    elapsedMs,
    audioBlob,
    analyserNode,
    frequencyData,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    requestPermission,
    errorMessage,
  };
}
