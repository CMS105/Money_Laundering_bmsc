'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TopKpiBar from '../components/TopKpiBar';
import ClusterListPanel from '../components/ClusterListPanel';
import CanvasPanel from '../components/CanvasPanel';
import DossierPanel from '../components/DossierPanel';
import { AlertCluster, ComparisonMetrics, AnalysisResponse } from '../types';
import { fetchAnalysis, injectAttack, FALLBACK_DATA } from '../services/api';
import { CheckCircle2, RefreshCw } from 'lucide-react';

export default function WorkbenchPage() {
  const [metrics, setMetrics] = useState<ComparisonMetrics>(FALLBACK_DATA.metrics);
  const [alerts, setAlerts] = useState<AlertCluster[]>(FALLBACK_DATA.alerts);
  const [selectedCluster, setSelectedCluster] = useState<AlertCluster | null>(
    FALLBACK_DATA.alerts[0] || null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isInjecting, setIsInjecting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data: AnalysisResponse = await fetchAnalysis();
      if (data && data.alerts && data.alerts.length > 0) {
        setMetrics(data.metrics);
        setAlerts(data.alerts);
        setSelectedCluster((prev) => {
          if (!prev) return data.alerts[0];
          const exists = data.alerts.find((a) => a.cluster_id === prev.cluster_id);
          return exists || data.alerts[0];
        });
      }
    } catch (err) {
      console.error('Failed to load analysis:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Live Attack Injection
  const handleInject = async (
    typology: 'CYCLIC_ROUND_TRIPPING' | 'FAN_OUT_IN' | 'MULE_CHAIN'
  ) => {
    setIsInjecting(true);
    try {
      const res = await injectAttack(typology);
      const newCluster = res.injected_cluster;

      // Update state with new cluster at top of list
      setAlerts((prev) => [newCluster, ...prev]);
      setSelectedCluster(newCluster);

      showToast(
        `🚨 Injected Live ${typology} Ring (${newCluster.cluster_id}) — Placed on Canvas!`,
        'success'
      );
    } catch (err) {
      console.error('Failed to inject attack:', err);
      showToast('Failed to inject attack into graph engine', 'info');
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 font-sans">
      {/* Top KPI Scoreboard & Demo Controls */}
      <TopKpiBar
        metrics={metrics}
        onInject={handleInject}
        isInjecting={isInjecting}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-400/60 shadow-2xl text-xs font-bold text-slate-100 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main 3-Panel Workbench Body */}
      <div
        className="flex-1 min-h-0 flex overflow-hidden relative w-full h-full"
        style={{ minHeight: 'calc(100vh - 80px)' }}
      >
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400 gap-2 font-mono text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Connecting to AML Graph Detection Engine...</span>
          </div>
        ) : (
          <>
            {/* Left Panel: Risk-Ranked Suspicious Cluster Navigator */}
            <ClusterListPanel
              alerts={alerts}
              selectedClusterId={selectedCluster?.cluster_id || ''}
              onSelectCluster={(cluster) => setSelectedCluster(cluster)}
            />

            {/* Center Canvas: @xyflow/react Interactive Money-Trail Graph */}
            <CanvasPanel cluster={selectedCluster} />

            {/* Right Panel: Plain-Language AI Money-Trail Dossier */}
            <DossierPanel cluster={selectedCluster} />
          </>
        )}
      </div>
    </div>
  );
}
