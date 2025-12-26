import React, { useState, useEffect, useRef } from 'react';
import { LaneStatus } from '../types';
import { Upload, AlertTriangle, Car, Activity, Zap } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { logger } from '../utils/logger';

interface LaneCardProps {
  lane: LaneStatus;
}

export const LaneCard: React.FC<LaneCardProps> = ({ lane }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64String = reader.result as string;
        // Keep the prefix if n8n expects it, or remove it. 
        // Usually full data URI is safer or just the base64 part. 
        // Let's send the full string for now as it contains mime type.
        resolve(base64String); 
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadStatus('error');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setUploadStatus('idle'), 3000);
      return;
    }

    // Validate file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      setUploadStatus('error');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setUploadStatus('idle'), 3000);
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus('idle');
      
      const base64Image = await convertToBase64(file);
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

      if (!webhookUrl) {
        logger.warn("VITE_N8N_WEBHOOK_URL is not set. Simulating upload.", { laneId: lane.lane_id });
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
        setUploadStatus('success');
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setUploadStatus('idle'), 3000);
        return;
      }

      const payload = {
        lane_id: lane.lane_id,
        image_base64: base64Image,
        timestamp: new Date().toISOString()
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Webhook upload failed: ${response.statusText}`);
      }

      setUploadStatus('success');
      logger.info("File uploaded successfully", { laneId: lane.lane_id, fileSize: file.size });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (error) {
      logger.error("Error uploading to webhook", error, { laneId: lane.lane_id, fileSize: file.size });
      setUploadStatus('error');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setUploadStatus('idle'), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 flex flex-col gap-4 shadow-xl relative overflow-hidden">
      {/* Green Wave Indicator */}
      {lane.next_intersection_cleared && (
        <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1 rounded-bl-xl border-l border-b border-green-500/30">
          <Zap size={12} /> Green Wave Active
        </div>
      )}

      <div className="flex justify-between items-center mt-2">
        <h3 className="text-xl font-bold text-white uppercase tracking-wider">{lane.lane_id.replace('_', ' ')}</h3>
        {lane.emergency_detected && (
          <div className="flex items-center gap-2 text-red-500 animate-pulse bg-red-950/30 px-3 py-1 rounded-full border border-red-900/50">
            <AlertTriangle size={16} />
            <span className="text-xs font-bold">EMERGENCY</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800 flex items-center gap-3">
          <div className="bg-blue-900/30 p-2 rounded-md text-blue-400">
            <Car size={18} />
          </div>
          <div>
            <div className="text-zinc-500 text-xs font-medium uppercase">Vehicles</div>
            <div className="text-white font-mono text-lg font-bold">{lane.vehicle_count}</div>
          </div>
        </div>
        <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800 flex items-center gap-3">
          <div className="bg-purple-900/30 p-2 rounded-md text-purple-400">
            <Activity size={18} />
          </div>
          <div>
            <div className="text-zinc-500 text-xs font-medium uppercase">Density</div>
            <div className="text-white font-mono text-lg font-bold">
              {lane.vehicle_count > 15 ? 'HIGH' : lane.vehicle_count > 8 ? 'MED' : 'LOW'}
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Light Visual */}
      <div className="flex justify-center my-2">
        <div className="bg-zinc-950 p-4 rounded-full flex flex-col gap-4 border border-zinc-800 shadow-inner">
          <div className={twMerge("w-12 h-12 rounded-full transition-all duration-300", 
            lane.traffic_light_state === 'red' ? "bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.6)]" : "bg-red-950/30 opacity-30")} />
          <div className={twMerge("w-12 h-12 rounded-full transition-all duration-300", 
            lane.traffic_light_state === 'yellow' ? "bg-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.6)]" : "bg-yellow-950/30 opacity-30")} />
          <div className={twMerge("w-12 h-12 rounded-full transition-all duration-300", 
            lane.traffic_light_state === 'green' ? "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]" : "bg-green-950/30 opacity-30")} />
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="text-center py-2">
        <div className="text-6xl font-mono font-bold text-white tabular-nums tracking-tight">
          {lane.current_timer.toString().padStart(2, '0')}
        </div>
        <div className="text-zinc-500 text-xs mt-1 font-medium tracking-wide">SECONDS REMAINING</div>
      </div>

      {/* Camera Feed Section */}
      <div className="mt-auto pt-4 border-t border-zinc-800">
        <div className="flex flex-col gap-3">
          <label className={twMerge(
            "flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 group",
            isUploading 
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
              : uploadStatus === 'success'
                ? "bg-green-600/20 text-green-400 border border-green-600/30"
                : uploadStatus === 'error'
                  ? "bg-red-600/20 text-red-400 border border-red-600/30"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white hover:shadow-lg border border-transparent"
          )}>
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
            ) : uploadStatus === 'success' ? (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            ) : (
              <Upload size={18} className="group-hover:scale-110 transition-transform" />
            )}
            
            <span className="text-sm font-medium">
              {isUploading ? 'Analyzing Feed...' : 
               uploadStatus === 'success' ? 'Analysis Complete' : 
               uploadStatus === 'error' ? 'Upload Failed' : 'Upload Camera Feed'}
            </span>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
          <div className="text-center">
             <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Supports JPG/PNG • Max 5MB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
