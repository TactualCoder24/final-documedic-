import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Music, ArrowLeft, Play, Pause, SkipForward,
    SkipBack, Volume2, Heart, Share2, Sparkles,
    ListMusic
} from '../../components/icons/Icons';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Link } from 'react-router-dom';

interface Track {
    id: string;
    title: string;
    artist: string;
    duration: string;
    moods: string[];
}

const playlists = [
    {
        name: 'Calm & Peaceful',
        description: 'Soft instrumental tracks to lower anxiety and find focus.',
        color: 'bg-emerald-500/10 text-emerald-500',
        icon: Sparkles
    },
    {
        name: 'Energetic & Joyful',
        description: 'Uplifting beats to boost your mood and energy levels.',
        color: 'bg-amber-500/10 text-amber-500',
        icon: Play
    },
    {
        name: 'Deep Reflection',
        description: 'Melancholic piano and ambient sounds for emotional processing.',
        color: 'bg-indigo-500/10 text-indigo-500',
        icon: Music
    },
    {
        name: 'Sleep & Relaxation',
        description: 'Nature sounds and white noise for better rest.',
        color: 'bg-violet-500/10 text-violet-500',
        icon: Heart
    }
];

const mockTracks: Track[] = [
    { id: '1', title: 'Midnight Rain', artist: 'Nature Sounds', duration: '3:45', moods: ['Calm', 'Sleep'] },
    { id: '2', title: 'Golden Hour', artist: 'Skyline', duration: '4:20', moods: ['Joyful', 'Energetic'] },
    { id: '3', title: 'Solitude', artist: 'Ambient Echoes', duration: '5:12', moods: ['Reflection', 'Calm'] },
    { id: '4', title: 'Sunrise Path', artist: 'Modern Zen', duration: '3:15', moods: ['Joyful', 'Energetic'] }
];

const MentibotMusic: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(mockTracks[0]);

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/mentibot">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold font-heading flex items-center gap-2">
                        <Music className="h-8 w-8 text-primary" />
                        Mood-Based Music
                    </h1>
                    <p className="text-muted-foreground">Soundscapes curated for your emotional journey.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Playlists */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                        <ListMusic className="h-5 w-5 text-primary" />
                        Featured Playlists
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {playlists.map((playlist) => (
                            <Card key={playlist.name} variant="premium" hover className="group border-primary/10">
                                <CardContent className="p-6">
                                    <div className={`w-12 h-12 rounded-xl ${playlist.color} flex items-center justify-center mb-4`}>
                                        <playlist.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{playlist.name}</h3>
                                    <p className="text-muted-foreground text-sm mt-1">{playlist.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <h2 className="text-xl font-bold font-heading mt-8 mb-6">Recent Tracks</h2>
                    <div className="space-y-2">
                        {mockTracks.map((track) => (
                            <div
                                key={track.id}
                                onClick={() => setCurrentTrack(track)}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${currentTrack?.id === track.id
                                        ? 'bg-primary/10 border-primary/30'
                                        : 'bg-card border-border/50 hover:bg-muted/50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-primary">
                                        {currentTrack?.id === track.id && isPlaying ? (
                                            <div className="flex gap-1 items-end h-4">
                                                <div className="w-1 bg-primary h-full animate-bounce" />
                                                <div className="w-1 bg-primary h-2 animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                <div className="w-1 bg-primary h-3 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                            </div>
                                        ) : (
                                            <Music className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{track.title}</h4>
                                        <p className="text-xs text-muted-foreground">{track.artist}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-muted-foreground">{track.duration}</span>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20">
                                        <Heart className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Now Playing Sidebar */}
                <div className="space-y-6">
                    <Card variant="premium" className="sticky top-24 border-primary/20 bg-gradient-to-b from-card to-primary/5">
                        <CardContent className="p-6">
                            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/10 mb-6 flex items-center justify-center relative overflow-hidden group">
                                <Music className="h-24 w-24 text-primary/40 group-hover:scale-110 transition-transform" />
                                <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="gradient" size="icon" className="w-16 h-16 rounded-full shadow-2xl">
                                        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="text-center space-y-2 mb-8">
                                <h3 className="text-2xl font-bold font-heading">{currentTrack?.title}</h3>
                                <p className="text-muted-foreground">{currentTrack?.artist}</p>
                                <div className="flex justify-center gap-2 pt-2">
                                    {currentTrack?.moods.map(m => (
                                        <span key={m} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                            {m}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Player Controls */}
                            <div className="space-y-6">
                                <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="absolute left-0 top-0 h-full bg-primary w-1/3" />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>1:25</span>
                                    <span>{currentTrack?.duration}</span>
                                </div>

                                <div className="flex items-center justify-center gap-6">
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                        <SkipBack className="h-6 w-6" />
                                    </Button>
                                    <Button
                                        variant="gradient"
                                        size="icon"
                                        className="w-14 h-14 rounded-full shadow-lg shadow-primary/20"
                                        onClick={() => setIsPlaying(!isPlaying)}
                                    >
                                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                        <SkipForward className="h-6 w-6" />
                                    </Button>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                                    <div className="relative h-1 w-full bg-muted rounded-full">
                                        <div className="absolute left-0 top-0 h-full bg-primary/50 w-2/3" />
                                    </div>
                                </div>

                                <div className="flex justify-center gap-4 pt-4">
                                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                                        <Heart className="h-4 w-4" />
                                        Save
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                                        <Share2 className="h-4 w-4" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MentibotMusic;
