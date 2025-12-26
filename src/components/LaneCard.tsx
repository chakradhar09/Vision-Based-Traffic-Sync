import React, { useState } from 'react';
import { LaneStatus } from '../types';
import { Upload, Video, AlertTriangle } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface LaneCardProps {
  lane: LaneStatus;
}

export const LaneCard: React.FC<LaneCardProps> = ({ lane }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const storageRef = ref(storage, `camera-feeds/${lane.laneId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setVideoUrl(url);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload camera feed");
    } finally {
      setIsUploading(false);
    }
  };

  const getTrafficLightColor = (status: string) => {
    switch (status) {
      case 'red': return 'bg-red-500 shadow-red-500/50';
      case 'yellow': return 'bg-yellow-500 shadow-yellow-500/50';
      case 'green': return 'bg-green-500 shadow-green-500/50';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 flex flex-col gap-4 shadow-xl">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white uppercase tracking-wider">{lane.laneId}</h3>
        {lane.emergencyOverride && (
          <div className="flex items-center gap-2 text-red-500 animate-pulse">
            <AlertTriangle size={20} />
            <span className="text-sm font-bold">EMERGENCY</span>
          </div>
        )}
      </div>

      {/* Traffic Light Visual */}
      <div className="flex justify-center my-4">
        <div className="bg-zinc-950 p-4 rounded-full flex flex-col gap-4 border border-zinc-800 shadow-inner">
          <div className={twMerge("w-12 h-12 rounded-full transition-all duration-300", 
            lane.status === 'red' ? "bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.6)]" : "bg-red-950/30 opacity-30")} />
          <div className={twMerge("w-12 h-12 rounded-full transition-all duration-300", 
            lane.status === 'yellow' ? "bg-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.6)]" : "bg-yellow-950/30 opacity-30")} />
          <div className={twMerge("w-12 h-12 rounded-full transition-all duration-300", 
            lane.status === 'green' ? "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]" : "bg-green-950/30 opacity-30")} />
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="text-center py-4">
        <div className="text-6xl font-mono font-bold text-white tabular-nums">
          {lane.secondsRemaining.toString().padStart(2, '0')}
        </div>
        <div className="text-zinc-500 text-sm mt-1">SECONDS REMAINING</div>
      </div>

      {/* Camera Feed Section */}
      <div className="mt-auto pt-4 border-t border-zinc-800">
        <div className="flex flex-col gap-3">
          {videoUrl ? (
            <video src={videoUrl} controls className="w-full rounded-lg aspect-video bg-black" />
          ) : (
            <div className="w-full aspect-video bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800 border-dashed">
              <div className="text-zinc-600 flex flex-col items-center gap-2">
                <Video size={24} />
                <span className="text-sm">No Signal</span>
              </div>
            </div>
          )}
          
          <label className={twMerge(
            "flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg cursor-pointer transition-colors",
            isUploading ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-zinc-800 hover:bg-zinc-700 text-white"
          )}>
            <Upload size={18} />
            <span className="text-sm font-medium">{isUploading ? 'Uploading...' : 'Upload Camera Feed'}</span>
            <input 
              type="file" 
              accept="video/*" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
