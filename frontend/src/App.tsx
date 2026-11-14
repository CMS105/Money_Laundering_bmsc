import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { GraphCanvas } from './components/GraphCanvas';
import { AlertsSidebar } from './components/AlertsSidebar';
import { BenchmarkScoreboard } from './components/BenchmarkScoreboard';
import { TimelineScrubber } from './components/TimelineScrubber';
import { SARModal } from './components/SARModal';
import {
  DatasetSummary,
  ComparativeBenchmarkResult,
  ClusterAnalysisResult,
  DetectedAlert,
  SARReport,
} from './types';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'graph' | 'benchmark'>('graph');
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [benchmark, setBenchmark] = useState<ComparativeBenchmarkResult | null>(null);
  const [analysis, setAnalysis] = useState<ClusterAnalysisResult | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<DetectedAlert | null>(null);
  const [sarReport, setSarReport] = useState<SARReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Temporal Scrubber State
  const [minTs, setMinTs] = useState<number>(0);
  const [maxTs, setMaxTs] = useState<number>(0);
  const [currentTs, setCurrentTs] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playTimerRef = useRef<any>(null);

  // Load Initial Data
  const loadData = async (alertId?: string) => {
    setIsLoading(true);
    try {
      // 1. Dataset summary
      const sumRes = await fetch('/api/dataset/summary');
      if (sumRes.ok) setSummary(await sumRes.json());

      // 2. Detection analysis
      const detRes = await fetch('/api/detect', { method: 'POST' });
      if (detRes.ok) setAnalysis(await detRes.json());

      // 3. Benchmark
      const benchRes = await fetch('/api/benchmark');
      if (benchRes.ok) setBenchmark(await benchRes.json());

      // 4. Graph data
      const url = alertId
        ? `/api/graph/react-flow?alert_id=${alertId}`
        : '/api/graph/react-flow?max_edges=250';
      const graphRes = await fetch(url);
      if (graphRes.ok) {
        const gd = await graphRes.json();
        setGraphData(gd);

        // Calculate time bounds for scrubber
        if (gd.edges.length > 0) {
          const timestamps = gd.edges
            .map((e: any) => e.data?.timestamp || 0)
            .filter((t: number) => t > 0);
          if (timestamps.length > 0) {
            const min = Math.min(...timestamps);
            const max = Math.max(...timestamps);
            setMinTs(min);
            setMaxTs(max);
            setCurrentTs(max);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load API data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Regenerate dataset
  const handleRegenerate = async () => {
    setIsLoading(true);
    setSelectedAlert(null);
    try {
      await fetch('/api/dataset/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          num_normal_tx: 2000,
          num_smurfing_rings: 10,
          num_cycle_rings: 10,
          num_mule_chains: 10,
          seed: Math.floor(Math.random() * 10000),
        }),
      });
      await loadData();
    } catch (err) {
      console.error('Failed to regenerate dataset:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Select Alert & isolate subgraph
  const handleSelectAlert = (alert: DetectedAlert) => {
    setSelectedAlert(alert);
    loadData(alert.alert_id);
  };

  const handleClearFilter = () => {
    setSelectedAlert(null);
    loadData();
  };

  // Open SAR Report
  const handleOpenSAR = async (alert: DetectedAlert) => {
    try {
      const res = await fetch(`/api/sar/${alert.alert_id}`);
      if (res.ok) {
        const report = await res.json();
        setSarReport(report);
      }
    } catch (err) {
      console.error('Failed to generate SAR report:', err);
    }
  };

  // Scrubber animation loop
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentTs((prev) => {
          const step = Math.max(1, Math.floor((maxTs - minTs) / 60));
          if (prev >= maxTs) {
            setIsPlaying(false);
            return maxTs;
          }
          return prev + step;
        });
      }, 100);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, minTs, maxTs]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header
        summary={summary}
        onRefresh={handleRegenerate}
        isLoading={isLoading}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <main className="flex-1 flex overflow-hidden">
        {activeView === 'graph' ? (
          <>
            <AlertsSidebar
              analysis={analysis}
              selectedAlert={selectedAlert}
              onSelectAlert={handleSelectAlert}
              onOpenSAR={handleOpenSAR}
              onClearFilter={handleClearFilter}
            />
            <div className="flex-1 relative flex flex-col">
              <GraphCanvas
                graphData={graphData}
                selectedAlert={selectedAlert}
                timeFilterTimestamp={currentTs}
              />
              {minTs > 0 && maxTs > minTs && (
                <TimelineScrubber
                  minTimestamp={minTs}
                  maxTimestamp={maxTs}
                  currentTimestamp={currentTs}
                  onChange={(ts) => setCurrentTs(ts)}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                  onReset={() => {
                    setIsPlaying(false);
                    setCurrentTs(minTs);
                  }}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <BenchmarkScoreboard benchmark={benchmark} />
          </div>
        )}
      </main>

      {/* FinCEN SAR Report Modal */}
      <SARModal sar={sarReport} onClose={() => setSarReport(null)} />
    </div>
  );
};

