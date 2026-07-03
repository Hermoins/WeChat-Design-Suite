import { useState, useCallback, useRef } from "react";
import { Platform } from "react-native";

export interface SpeechResult {
  transcript: string;
  route?: { from: string; to: string };
  timeType?: "now" | "soon" | "scheduled";
  seats?: number;
}

function parseTranscript(text: string): Omit<SpeechResult, "transcript"> {
  const result: Omit<SpeechResult, "transcript"> = {};

  const hasXinchengzi = text.includes("新城子") || text.includes("新城");
  const hasDaoyuan = text.includes("道义") || text.includes("道义商圈");

  if (hasXinchengzi && hasDaoyuan) {
    const xIdx = text.indexOf("新城");
    const dIdx = text.indexOf("道义");
    if (xIdx < dIdx) {
      result.route = { from: "新城子", to: "道义商圈" };
    } else {
      result.route = { from: "道义商圈", to: "新城子" };
    }
  } else if (hasXinchengzi) {
    result.route = { from: "新城子", to: "道义商圈" };
  } else if (hasDaoyuan) {
    result.route = { from: "道义商圈", to: "新城子" };
  }

  if (
    text.includes("马上") ||
    text.includes("现在") ||
    text.includes("立即") ||
    text.includes("立刻")
  ) {
    result.timeType = "now";
  } else if (
    text.includes("十分钟") ||
    text.includes("10分钟") ||
    text.includes("一会") ||
    text.includes("稍等")
  ) {
    result.timeType = "soon";
  } else if (
    text.includes("预约") ||
    text.includes("明天") ||
    text.includes("后天") ||
    text.includes("计划") ||
    text.includes("定时")
  ) {
    result.timeType = "scheduled";
  }

  const seatMatch = text.match(/([一二三四五六1-6])[\s个]?座/);
  if (seatMatch) {
    const map: Record<string, number> = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6 };
    result.seats = map[seatMatch[1]] ?? parseInt(seatMatch[1]);
  }

  return result;
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [lastResult, setLastResult] = useState<SpeechResult | null>(null);
  const recognitionRef = useRef<any>(null);

  const isSupported =
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "zh-CN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const text: string = event.results[0][0].transcript;
      const parsed = parseTranscript(text);
      setLastResult({ transcript: text, ...parsed });
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const clearResult = useCallback(() => setLastResult(null), []);

  return { isListening, lastResult, startListening, stopListening, clearResult, isSupported };
}
