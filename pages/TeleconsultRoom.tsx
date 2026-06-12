import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ArrowLeft, Video } from '../components/icons/Icons';
import { useAuth } from '../hooks/useAuth';

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

const JITSI_SCRIPT_SRC = 'https://meet.jit.si/external_api.js';

const loadJitsiScript = (): Promise<void> => {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${JITSI_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = JITSI_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const TeleconsultRoom: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    loadJitsiScript()
      .then(() => {
        if (cancelled || !containerRef.current || !appointmentId) return;
        const roomName = `documedic-consult-${appointmentId}`;
        apiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: user?.displayName || 'Guest',
          },
          configOverwrite: {
            prejoinPageEnabled: true,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          },
        });
        setLoading(false);

        apiRef.current.addEventListener('readyToClose', () => {
          navigate(-1);
        });
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load video call. Please check your internet connection and try again.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      apiRef.current?.dispose?.();
    };
  }, [appointmentId, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex items-center gap-3 p-3 border-b border-border/60 bg-card">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Video className="h-4 w-4" /> Video Visit
        </div>
      </div>
      <div className="flex-1 relative">
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            Connecting to video call...
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-destructive text-sm px-4 text-center">
            {error}
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default TeleconsultRoom;
