"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useAccount } from "@/context/AccountContext";
import { getCurrencySymbol } from "@/components/common/Money";
import {
  Bot,
  Sparkles,
  Send,
  RefreshCw,
  History,
  BrainCircuit,
  Cpu,
  Globe,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AVAILABLE_MODELS = [
  { label: "Auto Free Router (Recommended)", value: "openrouter/free" },
  {
    label: "Nex AGI N2.5 Mini",
    value: "nex-agi/nex-n2.5-mini:free",
  },
  { label: "Cohere North Mini", value: "cohere/north-mini-code:free" },
  {
    label: "NVIDIA LLaMA Nemotron Embed VL",
    value: "nvidia/nemotron-3-super-120b-a12b:free",
  },
  {
    label: "Inclusion Ling 3.0 Flash VL",
    value: "inclusionai/ling-3.0-flash-sante:free",
  },
  {
    label: "Space Bunny Alpha",
    value: "stealth/space-bunny-alpha",
  },
];

export default function AIBuddyPage() {
  const { selectedAccountId, selectedAccount } = useAccount();
  const [activeTab, setActiveTab] = useState<"chat" | "review">("chat");
  const [selectedModel, setSelectedModel] = useState("openrouter/free");
  const [enableWebSearch, setEnableWebSearch] = useState(true);

  const currSym = getCurrencySymbol(selectedAccount?.currency);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm your **Trading Buddy**. I'm connected directly to your ledger for **${selectedAccount?.name || "your account"}** (denominated in **${selectedAccount?.currency || "USD"} - ${currSym}**), and live web search is **active**. Ask me about your trade history, or ask for live market updates on assets like NVIDIA, Gold, or upcoming economic events!`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Weekly Review State
  const [reports, setReports] = useState<any[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchReports = async () => {
    if (!selectedAccountId) return;
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: selectedAccountId,
          action: "get-reports",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
        if (data.length > 0 && !selectedReport) {
          setSelectedReport(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedAccountId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedAccountId || isChatSending) return;

    const userText = inputMessage.trim();
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsChatSending(true);

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: selectedAccountId,
          action: "chat",
          model: selectedModel,
          enableWebSearch,
          messages: messages.slice(-6),
          userQuestion: userText,
          currency: selectedAccount?.currency || "USD",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error: ${err.message || "Failed to reach AI Coach. Check your OpenRouter key or model settings."}`,
        },
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedAccountId || isGeneratingReport) return;
    setIsGeneratingReport(true);

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: selectedAccountId,
          action: "generate-weekly-report",
          model: selectedModel,
          currency: selectedAccount?.currency || "USD",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review generation failed");

      setReports((prev) => [data, ...prev]);
      setSelectedReport(data);
      setActiveTab("review");
    } catch (err: any) {
      alert(`Report Error: ${err.message || "Check your OpenRouter API key"}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100dvh-5.5rem)] md:h-[calc(100vh-6.5rem)] flex flex-col space-y-3 pb-2 pt-1">
      {/* Header Bar & Responsive Control Strip */}
      <div className="border-b border-[#1b1d2b] pb-3 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                AI Trading Buddy
              </h1>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Institutional Edge
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 hidden sm:block">
              Tactical trade reviews, real-time market scans, and discipline
              auditing.
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex p-0.5 sm:p-1 bg-[#0e101a] border border-[#1b1d2b] rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
                activeTab === "chat"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Coach
            </button>
            <button
              onClick={() => setActiveTab("review")}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
                activeTab === "review"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Reviews
            </button>
          </div>
        </div>

        {/* Compact Horizontal Toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {/* Web Search Toggle Button */}
          <button
            onClick={() => setEnableWebSearch(!enableWebSearch)}
            title="Toggle Live Market Web Search"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold border shrink-0 transition-all ${
              enableWebSearch
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-[#0e101a] text-zinc-500 border-[#1b1d2b] hover:text-zinc-300"
            }`}
          >
            <Globe
              className={`h-3.5 w-3.5 ${enableWebSearch ? "text-emerald-400 animate-pulse" : ""}`}
            />
            <span>Search: {enableWebSearch ? "ON" : "OFF"}</span>
          </button>

          {/* Model Selector Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0e101a] border border-[#1b1d2b] shrink-0 min-w-0">
            <Cpu className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-[11px] sm:text-xs text-zinc-300 focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[220px] truncate"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option
                  key={m.value}
                  value={m.value}
                  className="bg-[#141624] text-zinc-200"
                >
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Review Button */}
          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] sm:text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all shrink-0 ml-auto disabled:opacity-50"
          >
            {isGeneratingReport ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>{isGeneratingReport ? "Analyzing..." : "Review"}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Chat Mode */}
      {activeTab === "chat" && (
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-[#1b1d2b] bg-[#0e101a] overflow-hidden">
          {/* Scrollable Message History */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 sm:gap-3 max-w-[92%] sm:max-w-3xl ${
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-xl flex items-center justify-center shrink-0 ${
                    m.role === "assistant"
                      ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                      : "bg-[#1e2030] text-zinc-300 font-bold text-[10px] sm:text-xs"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ) : (
                    "TB"
                  )}
                </div>
                <div
                  className={`p-3 sm:p-4 rounded-2xl text-xs leading-relaxed ${
                    m.role === "assistant"
                      ? "bg-[#141624] text-zinc-200 border border-[#232536]"
                      : "bg-purple-600 text-white"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-invert prose-xs max-w-none space-y-2 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-white [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-purple-300 [&_strong]:text-white [&_em]:text-zinc-400 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_p]:leading-relaxed break-words">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">
                      {m.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isChatSending && (
              <div className="flex gap-2 sm:gap-3 max-w-3xl mr-auto items-center text-xs text-zinc-500">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
                </div>
                <span className="text-[11px] sm:text-xs">
                  {enableWebSearch
                    ? "Scanning live markets & journal..."
                    : "Coach is analyzing..."}
                </span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 sm:p-4 border-t border-[#1b1d2b] bg-[#121320] flex items-center gap-2 sm:gap-3 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask about trades or markets (e.g. 'How is Gold today?')..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isChatSending}
              className="flex-1 bg-[#181a29] border border-[#26283d] text-xs text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isChatSending || !inputMessage.trim()}
              className="p-2 sm:p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50 shrink-0"
            >
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Executive Reviews Mode */}
      {activeTab === "review" && (
        <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-4 gap-3 md:gap-6 overflow-hidden">
          {/* Past Reports List */}
          <div className="md:col-span-1 rounded-2xl border border-[#1b1d2b] bg-[#0e101a] p-3 sm:p-4 flex flex-col max-h-44 md:max-h-full shrink-0">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-1.5 shrink-0">
              <History className="h-3.5 w-3.5 text-purple-400" /> Evaluations
            </span>
            <div className="space-y-1.5 sm:space-y-2 overflow-y-auto flex-1">
              {reports.length === 0 ? (
                <p className="text-xs text-zinc-500 mt-2 text-center">
                  No evaluations yet. Click &quot;Review&quot; above.
                </p>
              ) : (
                reports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReport(r)}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all ${
                      selectedReport?.id === r.id
                        ? "bg-purple-600/15 border-purple-500/40 text-white"
                        : "bg-[#141624] border-[#232536] text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold font-mono truncate">
                        {r.weekRange}
                      </span>
                      <span className="text-[11px] sm:text-xs font-extrabold text-purple-400 px-1.5 py-0.5 rounded bg-[#1f2238] border border-[#2a2d48]">
                        {r.grade}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Report View Panel */}
          <div className="flex-1 md:col-span-3 rounded-2xl border border-[#1b1d2b] bg-[#0e101a] p-4 sm:p-6 overflow-y-auto min-h-0">
            {selectedReport ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between border-b border-[#1b1d2b] pb-3 sm:pb-4">
                  <div>
                    <span className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider">
                      Evaluation for {selectedReport.weekRange}
                    </span>
                    <h2 className="text-base sm:text-xl font-bold text-white mt-0.5">
                      Discipline & Edge Audit
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[11px] sm:text-xs text-zinc-400 hidden sm:inline">
                      Assigned Grade
                    </span>
                    <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-base sm:text-xl font-extrabold text-white shadow-lg shadow-purple-900/40">
                      {selectedReport.grade}
                    </div>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-xs text-zinc-300 leading-relaxed space-y-2.5 font-sans [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-purple-300 [&_strong]:text-white [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-1 [&_ul]:list-disc [&_ul]:pl-4 break-words">
                  <ReactMarkdown>{selectedReport.analysis}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-8">
                <BrainCircuit className="h-8 w-8 sm:h-10 sm:w-10 text-zinc-600 mb-2" />
                <p className="text-xs sm:text-sm">
                  Select an evaluation or generate a new one.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
