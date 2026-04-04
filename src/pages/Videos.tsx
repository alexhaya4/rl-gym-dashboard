import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, Trash2, Play } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { videoApi } from '../api/video';
import { environmentsApi } from '../api/environments';
import { apiClient, getItems } from '../api/client';
import type { Algorithm, VideoStatus } from '../types';

const statusVariant = (s: string) => {
  switch (s) {
    case 'completed': return 'success' as const;
    case 'recording': return 'info' as const;
    case 'failed': return 'error' as const;
    case 'pending': return 'warning' as const;
    default: return 'default' as const;
  }
};

export default function Videos() {
  const queryClient = useQueryClient();
  const [envId, setEnvId] = useState('CartPole-v1');
  const [algorithm, setAlgorithm] = useState('PPO');
  const [numEpisodes, setNumEpisodes] = useState(1);
  const [maxSteps, setMaxSteps] = useState(1000);
  const [fps, setFps] = useState(30);
  const [activeRecordings, setActiveRecordings] = useState<Map<string, VideoStatus>>(new Map());
  const pollRefs = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);

  const { data: availableEnvs } = useQuery({
    queryKey: ['environments-available'],
    queryFn: () => environmentsApi.available(),
  });

  const { data: algorithms } = useQuery({
    queryKey: ['algorithms'],
    queryFn: async () => {
      const res = await apiClient.get('/algorithms/');
      return getItems<Algorithm>(res.data);
    },
  });

  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => videoApi.list(),
    refetchInterval: 10000,
  });

  const startPoll = useCallback((videoId: string) => {
    if (pollRefs.current.has(videoId)) return;
    const interval = setInterval(async () => {
      try {
        const status = await videoApi.getStatus(videoId);
        setActiveRecordings((prev) => new Map(prev).set(videoId, status));
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          pollRefs.current.delete(videoId);
          queryClient.invalidateQueries({ queryKey: ['videos'] });
        }
      } catch {
        clearInterval(interval);
        pollRefs.current.delete(videoId);
      }
    }, 2000);
    pollRefs.current.set(videoId, interval);
  }, [queryClient]);

  useEffect(() => {
    return () => {
      pollRefs.current.forEach((interval) => clearInterval(interval));
    };
  }, []);

  const recordMutation = useMutation({
    mutationFn: () =>
      videoApi.record({
        environment_id: envId,
        algorithm,
        num_episodes: numEpisodes,
        max_steps: maxSteps,
        fps,
      }),
    onSuccess: (data) => {
      setActiveRecordings((prev) => new Map(prev).set(data.video_id, { video_id: data.video_id, status: data.status, progress: 0 }));
      startPoll(data.video_id);
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => videoApi.deleteVideo(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos'] }),
  });

  const handlePlay = async (videoId: string) => {
    try {
      const url = await videoApi.getDownloadUrl(videoId);
      setPlayerUrl(url);
      setPlayerOpen(true);
    } catch { /* ignore */ }
  };

  const closePlayer = () => {
    if (playerUrl) URL.revokeObjectURL(playerUrl);
    setPlayerUrl(null);
    setPlayerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Videos</h1>
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
          Record and view agent performance videos
        </p>
      </div>

      {/* Record Video form */}
      <Card>
        <h2 className="text-base font-semibold mb-4">Record Video</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            recordMutation.mutate();
          }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Environment</label>
            <select
              value={envId}
              onChange={(e) => setEnvId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
            >
              {availableEnvs?.map((env) => (
                <option key={env.id || env.environment_id} value={env.id || env.environment_id}>
                  {env.id || env.environment_id}
                </option>
              )) ?? (
                <>
                  <option value="CartPole-v1">CartPole-v1</option>
                  <option value="LunarLander-v2">LunarLander-v2</option>
                </>
              )}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
            >
              {algorithms?.map((alg) => (
                <option key={alg.name} value={alg.name}>{alg.name}</option>
              )) ?? ['PPO', 'A2C', 'DQN'].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Episodes (1-5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={numEpisodes}
              onChange={(e) => setNumEpisodes(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Max Steps</label>
            <input
              type="number"
              min={100}
              max={10000}
              step={100}
              value={maxSteps}
              onChange={(e) => setMaxSteps(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">FPS (10-60)</label>
            <input
              type="number"
              min={10}
              max={60}
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
            />
          </div>
          <Button type="submit" loading={recordMutation.isPending}>
            <Video size={16} />
            Record
          </Button>
        </form>
      </Card>

      {/* Active recordings */}
      {activeRecordings.size > 0 && (
        <Card>
          <h2 className="text-base font-semibold mb-4">Active Recordings</h2>
          <div className="space-y-3">
            {[...activeRecordings.values()].map((rec) => (
              <div key={rec.video_id} className="flex items-center gap-4">
                <Badge variant={statusVariant(rec.status)}>{rec.status}</Badge>
                <span className="font-mono text-xs flex-1">{rec.video_id}</span>
                <div className="w-32 h-2 rounded-full dark:bg-dark-border bg-light-border overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${Math.min(rec.progress * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-mono">{(rec.progress * 100).toFixed(0)}%</span>
                {rec.error && <span className="text-xs text-red-500">{rec.error}</span>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Videos list */}
      {isLoading ? (
        <Card padding="none">
          <div className="animate-pulse p-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded dark:bg-dark-border bg-light-border" />
            ))}
          </div>
        </Card>
      ) : videos && videos.length > 0 ? (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-dark-border border-light-border">
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Video ID</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Episodes</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Reward</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Duration</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Size</th>
                  <th className="text-right px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr key={v.video_id} className="border-b last:border-b-0 dark:border-dark-border border-light-border dark:hover:bg-dark-hover/50 hover:bg-light-hover/50">
                    <td className="px-5 py-3 font-mono text-xs">{v.video_id.slice(0, 12)}...</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant(v.status)}>{v.status}</Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">{v.num_episodes}</td>
                    <td className="px-5 py-3 font-mono text-xs">{v.total_reward.toFixed(1)}</td>
                    <td className="px-5 py-3 font-mono text-xs">{v.duration_seconds.toFixed(1)}s</td>
                    <td className="px-5 py-3 font-mono text-xs">{v.file_size_mb.toFixed(1)} MB</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {v.status === 'completed' && (
                          <Button variant="ghost" size="sm" onClick={() => handlePlay(v.video_id)}>
                            <Play size={13} />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate(v.video_id)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">No videos yet</p>
          </div>
        </Card>
      )}

      {/* Video player modal */}
      <Modal open={playerOpen} onClose={closePlayer} title="Video Player" maxWidth="max-w-3xl">
        {playerUrl && (
          <video controls autoPlay className="w-full rounded-[var(--radius-card)]">
            <source src={playerUrl} />
          </video>
        )}
      </Modal>
    </div>
  );
}
