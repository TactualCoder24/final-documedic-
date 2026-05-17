import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import EmptyState from '../components/ui/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import { Users, Trash2, Heart, MessageCircle, AlertTriangle, Search, Filter, ImageIcon, Send, ShieldCheck, Share2, Compass, Bookmark, Clock, TrendingUp, Star } from '../components/icons/Icons';
import { CommunityPost } from '../types';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getCommunityPosts, addCommunityPost, deleteCommunityPost, togglePostLike, reportPost, addCommunityComment, deleteCommunityComment, toggleCommentLike } from '../services/dataSupabase';
import { supabase } from '../services/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';

const CATEGORIES = ['General', 'Diet', 'Mental Health', 'Chronic Illness', 'Questions', 'Success Stories'];
const TRENDING_TAGS = ['#WellnessJourney', '#MentalHealthMatters', '#HealthyEating', '#Recovery', '#FitnessGoals'];

const Community: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtering & Searching
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'Home' | 'My Posts' | 'Saved'>('Home');

  // Expanded Post State (for comments)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  // Composer State
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const composerRef = useRef<HTMLDivElement>(null);
  const [composerTitle, setComposerTitle] = useState('');
  const [composerContent, setComposerContent] = useState('');
  const [composerCategory, setComposerCategory] = useState('General');
  const [composerAnonymous, setComposerAnonymous] = useState(false);
  const [composerImage, setComposerImage] = useState<File | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCommunityPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  // Click outside to collapse composer if empty
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (composerRef.current && !composerRef.current.contains(event.target as Node)) {
        if (!composerTitle && !composerContent && !composerImage) {
          setIsComposerExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [composerTitle, composerContent, composerImage]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesTab = activeTab === 'Home' || 
                         (activeTab === 'My Posts' && post.authorId === user?.uid) ||
                         (activeTab === 'Saved' && post.likes.includes(user?.uid || '')); // Mocking saved as liked for now
      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [posts, searchQuery, selectedCategory, activeTab, user?.uid]);

  const trendingTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    let hasTags = false;
    posts.forEach(post => {
      const tags = post.content.match(/#[a-zA-Z0-9_]+/g) || [];
      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        hasTags = true;
      });
    });
    
    if (!hasTags) {
      // Fallback: Use popular categories if no hashtags
      posts.forEach(post => {
        tagCounts[post.category] = (tagCounts[post.category] || 0) + 1;
      });
    }

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  const topVoices = useMemo(() => {
    const userScores: Record<string, { name: string, photo: string | undefined, score: number }> = {};
    
    posts.forEach(post => {
      if (!userScores[post.authorId]) {
         userScores[post.authorId] = { name: post.authorName, photo: post.authorPhotoURL, score: 0 };
      }
      userScores[post.authorId].score += 10; // 10 points for a post
      userScores[post.authorId].score += post.likes.length; // 1 point per like
      
      post.comments?.forEach(comment => {
         if (!userScores[comment.authorId]) {
             userScores[comment.authorId] = { name: comment.authorName, photo: comment.authorPhotoURL, score: 0 };
         }
         userScores[comment.authorId].score += 5; // 5 points per comment
      });
    });

    return Object.values(userScores)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [posts]);

  const handleDelete = async (id: string) => {
    if (window.confirm(t('community.confirm_delete', 'Are you sure you want to delete this post?'))) {
      await deleteCommunityPost(id);
      toast.success(t('community.deleted_success', "Post deleted successfully."));
      await refreshPosts();
    }
  };

  const handleReport = async (id: string) => {
    if (!user) return toast.error(t('common.login_required', "Please login to perform this action."));
    if (window.confirm(t('community.confirm_report', 'Report this post to moderators for rule violations?'))) {
      await reportPost(id, user.uid);
      toast.success(t('community.reported_success', "Post reported to moderators."));
    }
  };

  const handleToggleLike = async (id: string, isComment: boolean = false) => {
    if (!user) return toast.error(t('common.login_required', "Please login to perform this action."));
    try {
      if (isComment) {
        await toggleCommentLike(id, user.uid);
      } else {
        await togglePostLike(id, user.uid);
      }
      refreshPosts();
    } catch (err) {
      toast.error(t('community.like_failed', "Failed to toggle like."));
    }
  };

  const handlePublishPost = async () => {
    if (!user || !user.displayName) return toast.error(t('common.login_required', "Please login to post."));
    if (!composerTitle.trim() || !composerContent.trim()) {
      return toast.error(t('community.post_empty_error', "Title and content are required."));
    }

    setIsPublishing(true);
    let imageUrl: string | undefined;

    try {
      if (composerImage) {
        const fileExt = composerImage.name.split('.').pop();
        const fileName = `community/${user.uid}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('medical-records')
          .upload(fileName, composerImage, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('medical-records').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      await addCommunityPost(
        user.uid,
        { title: composerTitle, content: composerContent, category: composerCategory, isAnonymous: composerAnonymous, imageUrl },
        { name: user.displayName, photoURL: user.photoURL }
      );

      toast.success(t('community.post_published', "Post published successfully!"));
      // Reset composer
      setComposerTitle('');
      setComposerContent('');
      setComposerCategory('General');
      setComposerAnonymous(false);
      setComposerImage(null);
      setIsComposerExpanded(false);
      await refreshPosts();
    } catch (error) {
      toast.error(t('community.publish_error', "Failed to publish post."));
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>, postId: string) => {
    e.preventDefault();
    if (!user || !user.displayName) return toast.error(t('common.login_required', "Please login."));
    const formData = new FormData(e.currentTarget);
    const content = formData.get('comment-content') as string;
    const isAnonymous = formData.get('comment-anonymous') === 'on';

    if (content.trim()) {
      await addCommunityComment(
        postId,
        user.uid,
        content,
        { name: user.displayName, photoURL: user.photoURL },
        isAnonymous
      );
      toast.success(t('community.comment_added', "Comment added!"));
      (e.target as HTMLFormElement).reset();
      await refreshPosts();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm(t('community.confirm_delete_comment', 'Delete this comment?'))) {
      await deleteCommunityComment(commentId);
      toast.success(t('community.comment_deleted', "Comment deleted."));
      await refreshPosts();
    }
  };

  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return t('time.just_now', "just now");
    let interval = seconds / 31536000;
    if (interval > 1) return t('time.years_ago', '{{count}}y', { count: Math.floor(interval) });
    interval = seconds / 2592000;
    if (interval > 1) return t('time.months_ago', '{{count}}mo', { count: Math.floor(interval) });
    interval = seconds / 86400;
    if (interval > 1) return t('time.days_ago', '{{count}}d', { count: Math.floor(interval) });
    interval = seconds / 3600;
    if (interval > 1) return t('time.hours_ago', '{{count}}h', { count: Math.floor(interval) });
    interval = seconds / 60;
    return t('time.minutes_ago', '{{count}}m', { count: Math.floor(interval) });
  };

  return (
    <div className="bg-secondary/5 min-h-[calc(100vh-80px)] -mt-6 -mx-4 sm:-mx-8 px-4 sm:px-8 py-6 rounded-t-3xl">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start">

          {/* Left Sidebar - Navigation & Categories */}
          <aside className="lg:col-span-1 xl:col-span-1 space-y-6 lg:sticky lg:top-24 hidden lg:block">
            
            {/* Primary Navigation */}
            <Card className="border border-border/40 shadow-sm bg-background/80 backdrop-blur-xl">
              <CardContent className="p-3 space-y-1">
                <Button
                  variant={activeTab === 'Home' ? 'secondary' : 'ghost'}
                  className={`w-full justify-start font-semibold rounded-xl h-12 text-base ${activeTab === 'Home' ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                  onClick={() => { setActiveTab('Home'); setSelectedCategory('All'); }}
                >
                  <Compass className="mr-3 h-5 w-5" />
                  {t('community.home', 'Home Feed')}
                </Button>
                {user && (
                  <>
                    <Button
                      variant={activeTab === 'My Posts' ? 'secondary' : 'ghost'}
                      className={`w-full justify-start font-semibold rounded-xl h-12 text-base ${activeTab === 'My Posts' ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                      onClick={() => setActiveTab('My Posts')}
                    >
                      <Clock className="mr-3 h-5 w-5" />
                      {t('community.my_posts', 'My Posts')}
                    </Button>
                    <Button
                      variant={activeTab === 'Saved' ? 'secondary' : 'ghost'}
                      className={`w-full justify-start font-semibold rounded-xl h-12 text-base ${activeTab === 'Saved' ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                      onClick={() => setActiveTab('Saved')}
                    >
                      <Bookmark className="mr-3 h-5 w-5" />
                      {t('community.saved', 'Liked Posts')}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Topics Filter */}
            <Card className="border border-border/40 shadow-sm bg-background/80 backdrop-blur-xl">
              <CardHeader className="pb-3 px-5 pt-5">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {t('community.topics', 'Discover Topics')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4 space-y-1">
                <Button
                  variant={selectedCategory === 'All' && activeTab === 'Home' ? 'secondary' : 'ghost'}
                  className={`w-full justify-start font-medium rounded-xl ${selectedCategory === 'All' && activeTab === 'Home' ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                  onClick={() => { setSelectedCategory('All'); setActiveTab('Home'); }}
                >
                  {t('community.everything', 'Everything')}
                </Button>
                {CATEGORIES.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'secondary' : 'ghost'}
                    className={`w-full justify-start font-medium rounded-xl ${selectedCategory === cat ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                    onClick={() => { setSelectedCategory(cat); setActiveTab('Home'); }}
                  >
                    {t(`community.category.${cat.toLowerCase().replace(' ', '_')}`, cat)}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Center Column - Main Feed */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
            
            {/* Mobile Search & Filter */}
            <div className="flex gap-3 lg:hidden mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('community.search_placeholder', 'Search...')}
                  className="pl-9 h-11 bg-background border-border/50 rounded-full shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="h-11 w-11 p-0 shrink-0 rounded-full bg-background border-border/50 shadow-sm" variant="outline" onClick={() => {
                const newCat = window.prompt(t('community.filter_prompt', 'Type category to filter:\n{{categories}}', { categories: ['All', ...CATEGORIES].join(', ') }), selectedCategory);
                if (newCat) setSelectedCategory(newCat);
              }}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Inline Composer (Twitter Style) */}
            <Card 
              ref={composerRef} 
              className={`border border-border/40 shadow-md transition-all duration-300 overflow-hidden ${isComposerExpanded ? 'ring-2 ring-primary/20 bg-background' : 'bg-background hover:border-primary/30'}`}
            >
              <div className="p-4 sm:p-5 flex gap-3 sm:gap-4">
                <div className="shrink-0 mt-1">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-11 h-11 rounded-full object-cover shadow-sm ring-1 ring-border" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm ring-1 ring-border">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  {!isComposerExpanded ? (
                    <div 
                      className="h-12 flex items-center px-4 rounded-full bg-secondary/30 text-muted-foreground cursor-text hover:bg-secondary/50 transition-colors border border-border/40 font-medium"
                      onClick={() => setIsComposerExpanded(true)}
                    >
                      {t('community.whats_on_your_mind', "Share your health journey or ask a question...")}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="space-y-3"
                    >
                      <Input
                        placeholder={t('community.post_title_placeholder', 'A clear, concise title (optional)')}
                        value={composerTitle}
                        onChange={(e) => setComposerTitle(e.target.value)}
                        className="border-none px-0 text-[19px] font-bold bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/50 h-auto py-1 shadow-none"
                      />
                      <textarea
                        placeholder={t('community.post_content_placeholder', 'What\'s on your mind?')}
                        value={composerContent}
                        onChange={(e) => setComposerContent(e.target.value)}
                        rows={4}
                        className="w-full resize-none border-none bg-transparent px-0 text-[16px] placeholder:text-muted-foreground/70 focus:outline-none"
                        autoFocus
                      />
                      
                      {composerImage && (
                        <div className="relative inline-block mt-2">
                          <img src={URL.createObjectURL(composerImage)} alt="Preview" className="max-h-64 rounded-xl object-cover border border-border/50 shadow-sm" />
                          <button 
                            onClick={() => setComposerImage(null)}
                            className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 backdrop-blur-md transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/40">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => setComposerImage(e.target.files?.[0] || null)}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-full text-primary hover:bg-primary/10 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            title="Attach Image"
                          >
                            <ImageIcon className="h-5 w-5" />
                          </Button>
                          <div className="h-6 w-px bg-border/60 mx-1"></div>
                          <select
                            value={composerCategory}
                            onChange={(e) => setComposerCategory(e.target.value)}
                            className="h-9 text-sm rounded-full bg-secondary/50 border border-border/50 text-foreground font-semibold px-4 appearance-none cursor-pointer hover:bg-secondary focus:ring-2 focus:ring-primary/30 transition-colors"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{t(`community.category.${cat.toLowerCase().replace(' ', '_')}`, cat)}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors bg-secondary/30 px-3 py-1.5 rounded-full border border-border/40">
                            <input 
                              type="checkbox" 
                              checked={composerAnonymous} 
                              onChange={(e) => setComposerAnonymous(e.target.checked)}
                              className="rounded w-3.5 h-3.5 text-primary focus:ring-primary border-border/80" 
                            />
                            {t('community.anonymous_toggle', 'Anonymous')}
                          </label>
                          <Button 
                            onClick={handlePublishPost} 
                            disabled={!composerContent.trim() || isPublishing}
                            className="rounded-full px-6 font-bold shadow-md hover:shadow-lg transition-all"
                          >
                            {isPublishing ? '...' : t('community.publish', 'Post')}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>

            {/* Posts Feed */}
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <Card key={i} className="p-5 border border-border/40 shadow-sm bg-background"><Skeleton variant="dashboard" /></Card>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <AnimatePresence>
                <div className="space-y-5">
                  {filteredPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="border border-border/40 shadow-sm hover:shadow-md hover:border-border/80 transition-all duration-300 bg-background overflow-hidden rounded-2xl">
                        <div className="p-5 sm:p-6 pb-3">
                          <div className="flex gap-4">
                            {/* Avatar Column */}
                            <div className="shrink-0">
                              {post.authorPhotoURL ? (
                                <img src={post.authorPhotoURL} alt={post.authorName} className="w-12 h-12 rounded-full object-cover border border-border/50 shadow-sm" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center border border-primary/10 shadow-sm">
                                  <Users className="h-6 w-6 text-primary" />
                                </div>
                              )}
                            </div>
                            
                            {/* Content Column */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-[16px] text-foreground hover:underline cursor-pointer tracking-tight">{post.authorName}</span>
                                  <span className="text-muted-foreground text-[14px]">·</span>
                                  <span className="text-muted-foreground text-[14px] hover:underline cursor-pointer">{timeSince(post.timestamp)}</span>
                                  <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ml-1">
                                    {t(`community.category.${post.category.toLowerCase().replace(' ', '_')}`, post.category)}
                                  </span>
                                </div>
                                <div className="flex gap-1 -mt-1.5 -mr-2">
                                  {user && user.uid !== post.authorId && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-500 rounded-full hover:bg-amber-500/10" onClick={() => handleReport(post.id)}>
                                      <AlertTriangle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {user && user.uid === post.authorId && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10" onClick={() => handleDelete(post.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              {post.title && <h3 className="font-bold text-[19px] leading-snug mb-2 text-foreground tracking-tight">{post.title}</h3>}
                              
                              <p className="text-foreground/90 whitespace-pre-wrap text-[16px] leading-relaxed break-words">{post.content}</p>
                              
                              {post.imageUrl && (
                                <div className="mt-4 rounded-2xl overflow-hidden border border-border/50 bg-secondary/10 shadow-sm">
                                  <img src={post.imageUrl} alt="Post attachment" className="w-full max-h-[500px] object-cover" loading="lazy" />
                                </div>
                              )}
                              
                              {/* Action Bar (Twitter Style) */}
                              <div className="flex items-center justify-between mt-4 max-w-md text-muted-foreground font-medium">
                                <button
                                  onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                                  className={`flex items-center gap-2 group text-[14px] transition-colors ${expandedPostId === post.id ? 'text-primary' : 'hover:text-primary'}`}
                                >
                                  <div className={`p-2 rounded-full transition-colors ${expandedPostId === post.id ? 'bg-primary/10' : 'group-hover:bg-primary/10'}`}>
                                    <MessageCircle className="h-[18px] w-[18px]" />
                                  </div>
                                  <span>{post.comments?.length || 0}</span>
                                </button>

                                <button
                                  onClick={() => handleToggleLike(post.id)}
                                  className={`flex items-center gap-2 group text-[14px] transition-colors ${post.likes.includes(user?.uid || '') ? 'text-rose-500' : 'hover:text-rose-500'}`}
                                >
                                  <div className={`p-2 rounded-full transition-colors ${post.likes.includes(user?.uid || '') ? 'bg-rose-500/10' : 'group-hover:bg-rose-500/10'}`}>
                                    <Heart className={`h-[18px] w-[18px] ${post.likes.includes(user?.uid || '') ? 'fill-current' : ''}`} />
                                  </div>
                                  <span>{post.likes.length > 0 ? post.likes.length : ''}</span>
                                </button>

                                <button className="flex items-center gap-2 group text-[14px] transition-colors hover:text-blue-500">
                                  <div className="p-2 rounded-full transition-colors group-hover:bg-blue-500/10">
                                    <Share2 className="h-[18px] w-[18px]" />
                                  </div>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Comments Thread */}
                        <AnimatePresence>
                          {expandedPostId === post.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t border-border/40 bg-secondary/5"
                            >
                              <div className="p-4 sm:px-6 sm:py-5">
                                <form onSubmit={(e) => handleAddComment(e, post.id)} className="mb-6">
                                  <div className="flex gap-3">
                                    <div className="shrink-0 mt-1 hidden sm:block">
                                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-inner">
                                        {user?.displayName?.charAt(0) || '?'}
                                      </div>
                                    </div>
                                    <div className="flex-1 relative">
                                      <textarea
                                        name="comment-content"
                                        placeholder={t('community.reply_placeholder', 'Post your reply...')}
                                        rows={1}
                                        required
                                        className="w-full resize-none rounded-2xl border border-border/60 bg-background px-4 py-3 text-[15px] shadow-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary pr-12 min-h-[48px] transition-all"
                                      />
                                      <button type="submit" className="absolute right-2 top-2 p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                                        <Send className="h-5 w-5" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex justify-end mt-2 sm:mr-2">
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">
                                      <input type="checkbox" name="comment-anonymous" className="rounded-sm bg-background border-border/60 text-primary focus:ring-primary h-3.5 w-3.5" />
                                      {t('community.reply_anonymously', 'Reply anonymously')}
                                    </label>
                                  </div>
                                </form>

                                {post.comments && post.comments.length > 0 ? (
                                  <div className="space-y-5">
                                    {post.comments.map(comment => (
                                      <div key={comment.id} className="flex gap-3">
                                        {/* Comment Avatar */}
                                        <div className="shrink-0">
                                          {comment.authorPhotoURL ? (
                                            <img src={comment.authorPhotoURL} alt={comment.authorName} className="w-9 h-9 rounded-full object-cover mt-0.5 border border-border/40" />
                                          ) : (
                                            <div className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mt-0.5 text-xs font-bold border border-border/50">
                                              {comment.authorName.charAt(0)}
                                            </div>
                                          )}
                                        </div>
                                        {/* Comment Body */}
                                        <div className="flex-1 min-w-0 pb-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-[15px] text-foreground hover:underline cursor-pointer">{comment.authorName}</span>
                                            <span className="text-muted-foreground text-[13px]">·</span>
                                            <span className="text-muted-foreground text-[13px] hover:underline cursor-pointer">{timeSince(comment.createdAt)}</span>
                                          </div>
                                          <p className="text-[15px] text-foreground/90 mt-0.5 break-words leading-relaxed">{comment.content}</p>
                                          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                                            <button
                                              onClick={() => handleToggleLike(comment.id, true)}
                                              className={`text-[13px] font-medium flex items-center gap-1.5 group transition-colors ${comment.likes.includes(user?.uid || '') ? 'text-rose-500' : 'hover:text-rose-500'}`}
                                            >
                                              <div className="p-1.5 -ml-1.5 rounded-full group-hover:bg-rose-500/10">
                                                <Heart className={`h-4 w-4 ${comment.likes.includes(user?.uid || '') ? 'fill-current' : ''}`} />
                                              </div>
                                              {comment.likes.length || ''}
                                            </button>
                                            {user?.uid === comment.authorId && (
                                              <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-[13px] font-medium text-muted-foreground hover:text-destructive flex items-center gap-1.5 group"
                                              >
                                                <div className="p-1.5 -ml-1.5 rounded-full group-hover:bg-destructive/10">
                                                  <Trash2 className="h-4 w-4" />
                                                </div>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/50 text-muted-foreground mb-3">
                                      <MessageCircle className="h-6 w-6" />
                                    </div>
                                    <p className="text-[15px] text-muted-foreground font-medium">{t('community.no_comments', 'No replies yet. Be the first to share your thoughts!')}</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            ) : (
              <Card className="border border-border/40 shadow-sm bg-background">
                <CardContent className="pt-16 pb-16 text-center">
                  <EmptyState
                    icon={Users}
                    title={searchQuery || selectedCategory !== 'All' ? t('community.empty_search_title', "No posts found") : t('community.empty_title', "Welcome to the Community!")}
                    description={searchQuery || selectedCategory !== 'All'
                      ? t('community.empty_search_desc', "Try adjusting your search terms or category filter.")
                      : t('community.empty_desc', "No posts yet. Be the first to share a story, ask a question, or offer support.")}
                    ctaText={t('community.write_post', "Write a Post")}
                    ctaAction={() => { setIsComposerExpanded(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Trending/Rules */}
          <aside className="lg:col-span-1 xl:col-span-1 space-y-6 hidden lg:block lg:sticky lg:top-24">
            
            <Card className="border border-border/40 shadow-sm bg-background/80 backdrop-blur-xl">
              <CardContent className="p-2 pt-2">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('community.search_placeholder', 'Search discussions...')}
                      className="h-11 pl-9 bg-secondary/40 border-transparent hover:bg-secondary/60 focus:bg-background focus:border-primary/50 rounded-xl transition-colors"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
              </CardContent>
            </Card>

            {/* Trending Topics (Real Data) */}
            {trendingTags.length > 0 && (
              <Card className="border border-border/40 shadow-sm bg-background/80 backdrop-blur-xl">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    {t('community.trending', 'Trending Now')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  {trendingTags.map((item, i) => (
                    <div key={item.tag} className="group cursor-pointer" onClick={() => setSearchQuery(item.tag)}>
                      <p className="text-[15px] font-bold text-foreground group-hover:text-primary transition-colors">{item.tag}</p>
                      <p className="text-[12px] text-muted-foreground">{item.count} {item.count === 1 ? 'Mention' : 'Mentions'}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Top Voices (Real Data) */}
            {topVoices.length > 0 && (
              <Card className="border border-border/40 shadow-sm bg-background/80 backdrop-blur-xl">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    {t('community.top_voices', 'Top Voices')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-4">
                  {topVoices.map((voice, i) => (
                    <div key={i} className="flex items-center gap-3 cursor-pointer group">
                      {voice.photo ? (
                        <img src={voice.photo} alt={voice.name} className="w-10 h-10 rounded-full object-cover border border-border/50" />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-primary/10 text-primary">
                          {voice.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-[14px] font-bold text-foreground group-hover:underline">{voice.name}</p>
                        <p className="text-[12px] text-muted-foreground">{voice.score} {t('community.points', 'Points')}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="border border-border/40 shadow-sm bg-background/80 backdrop-blur-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 w-full" />
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  {t('community.rules.title', 'Guidelines')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[13px] text-muted-foreground space-y-3 px-5 pb-5 pt-2">
                <div className="flex gap-2"><span className="font-bold text-foreground">1.</span> <p>{t('community.rules.1', 'Be respectful and supportive.')}</p></div>
                <div className="flex gap-2"><span className="font-bold text-foreground">2.</span> <p>{t('community.rules.2', 'No medical diagnoses.')}</p></div>
                <div className="flex gap-2"><span className="font-bold text-foreground">3.</span> <p>{t('community.rules.3', 'Keep sensitive topics safe.')}</p></div>
              </CardContent>
            </Card>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default Community;
