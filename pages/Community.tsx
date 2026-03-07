import React, { useState, useEffect, useCallback, useMemo } from 'react';
import EmptyState from '../components/ui/EmptyState';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Users, Plus, Trash2, Heart, MessageCircle, AlertTriangle, Search, Filter } from '../components/icons/Icons';
import { CommunityPost } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getCommunityPosts, addCommunityPost, deleteCommunityPost, togglePostLike, reportPost, addCommunityComment, deleteCommunityComment, toggleCommentLike } from '../services/dataSupabase';
import { supabase } from '../services/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';

const CATEGORIES = ['General', 'Diet', 'Mental Health', 'Chronic Illness', 'Questions', 'Success Stories'];

const Community: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtering & Searching
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Expanded Post State (for comments)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

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

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

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
      // Optimistic update could go here, but doing full refresh for simplicity
      refreshPosts();
    } catch (err) {
      toast.error(t('community.like_failed', "Failed to toggle like."));
    }
  };

  const handleAddPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !user.displayName) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get('post-title') as string;
    const content = formData.get('post-content') as string;
    const category = formData.get('post-category') as string;
    const isAnonymous = formData.get('post-anonymous') === 'on';
    const imageFile = (formData.get('post-image') as File);

    let imageUrl: string | undefined;

    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `community/${user.uid}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('medical-records')
        .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        toast.error(t('community.image_upload_failed', 'Failed to upload image.'));
        console.error(uploadError);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('medical-records').getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }

    if (title && content) {
      await addCommunityPost(
        user.uid,
        { title, content, category, isAnonymous, imageUrl },
        { name: user.displayName, photoURL: user.photoURL }
      );
      toast.success(t('community.post_published', "Post published successfully!"));
      await refreshPosts();
      setIsModalOpen(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>, postId: string) => {
    e.preventDefault();
    if (!user || !user.displayName) return;
    const formData = new FormData(e.currentTarget);
    const content = formData.get('comment-content') as string;
    const isAnonymous = formData.get('comment-anonymous') === 'on';

    if (content) {
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
    if (interval > 1) return t('time.years_ago', '{{count}}y ago', { count: Math.floor(interval) });
    interval = seconds / 2592000;
    if (interval > 1) return t('time.months_ago', '{{count}}mo ago', { count: Math.floor(interval) });
    interval = seconds / 86400;
    if (interval > 1) return t('time.days_ago', '{{count}}d ago', { count: Math.floor(interval) });
    interval = seconds / 3600;
    if (interval > 1) return t('time.hours_ago', '{{count}}h ago', { count: Math.floor(interval) });
    interval = seconds / 60;
    return t('time.minutes_ago', '{{count}}m ago', { count: Math.floor(interval) });
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

        {/* Left Sidebar - Filters & Info */}
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('community.categories', 'Categories')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={selectedCategory === 'All' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedCategory('All')}
              >
                {t('community.everything', 'Everything')}
              </Button>
              {CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {t(`community.category.${cat.toLowerCase().replace(' ', '_')}`, cat)}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('community.rules.title', 'Community Rules')}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>{t('community.rules.1', '1. Be respectful and supportive.')}</p>
              <p>{t('community.rules.2', '2. Do not offer professional medical diagnoses.')}</p>
              <p>{t('community.rules.3', '3. Keep sensitive topics safe with anonymous posting.')}</p>
              <p>{t('community.rules.4', '4. Report abusive behavior immediately.')}</p>
            </CardContent>
          </Card>
        </aside>

        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('community.search_placeholder', 'Search discussions...')}
                className="pl-9 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="h-12 shrink-0 md:hidden" variant="outline" onClick={() => {
              const newCat = window.prompt(t('community.filter_prompt', 'Type category to filter:\n{{categories}}', { categories: ['All', ...CATEGORIES].join(', ') }), selectedCategory);
              if (newCat) setSelectedCategory(newCat);
            }}>
              <Filter className="h-4 w-4 mr-2" />
              {t('common.filter', 'Filter')}
            </Button>
            <Button className="h-12 shrink-0 pr-6 pl-5" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> {t('community.new_post', 'New Post')}
            </Button>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="pt-6 text-center py-20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground mt-4">{t('community.loading_posts', 'Loading community posts...')}</p>
              </CardContent>
            </Card>
          ) : filteredPosts.length > 0 ? (
            <AnimatePresence>
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:border-primary/30 transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            {post.authorPhotoURL ? (
                              <img src={post.authorPhotoURL} alt={post.authorName} className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-secondary/80 flex items-center justify-center">
                                <Users className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="text-sm">
                              <span className="font-semibold text-foreground">{post.authorName}</span>
                              <p className="text-muted-foreground text-xs flex items-center gap-2">
                                {timeSince(post.timestamp)}
                                <span className="bg-secondary/50 text-secondary-foreground px-2 py-0.5 rounded-full text-[10px] font-medium">
                                  {t(`community.category.${post.category.toLowerCase().replace(' ', '_')}`, post.category)}
                                </span>
                              </p>
                            </div>
                          </div>
                          <CardTitle className="text-xl leading-tight font-heading">{post.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                          {user && user.uid !== post.authorId && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-500 flex-shrink-0" onClick={() => handleReport(post.id)} title={t('community.report_post', 'Report Post')}>
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          )}
                          {user && user.uid === post.authorId && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => handleDelete(post.id)} title={t('community.delete_post', 'Delete Post')}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-foreground whitespace-pre-wrap text-[15px] leading-relaxed opacity-90">{post.content}</p>
                      {post.imageUrl && (
                        <img src={post.imageUrl} alt="Post attachment" className="mt-3 rounded-lg max-h-80 w-full object-cover border" />
                      )}
                    </CardContent>

                    {/* Interaction Bar */}
                    <div className="px-6 py-3 bg-secondary/10 border-t border-border/30 flex items-center gap-4">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${post.likes.includes(user?.uid || '') ? 'text-rose-500' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <Heart className={`h-4 w-4 ${post.likes.includes(user?.uid || '') ? 'fill-current' : ''}`} />
                        {post.likes.length > 0 ? post.likes.length : t('common.like', 'Like')}
                      </button>
                      <button
                        onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${expandedPostId === post.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <MessageCircle className="h-4 w-4" />
                        {(post.comments?.length || 0) > 0 ? post.comments.length : t('common.comment', 'Comment')}
                      </button>
                    </div>

                    {/* Comments Section */}
                    <AnimatePresence>
                      {expandedPostId === post.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden border-t border-border/50 bg-secondary/5 rounded-b-xl"
                        >
                          <div className="p-4 sm:p-6 space-y-6">
                            {post.comments && post.comments.length > 0 ? (
                              <div className="space-y-5">
                                {post.comments.map(comment => (
                                  <div key={comment.id} className="flex gap-3">
                                    {comment.authorPhotoURL ? (
                                      <img src={comment.authorPhotoURL} alt={comment.authorName} className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                                        {comment.authorName.charAt(0)}
                                      </div>
                                    )}
                                    <div className="flex-1 bg-background border border-border/60 rounded-2xl rounded-tl-sm p-3 shadow-sm">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-xs tracking-tight">{comment.authorName}</span>
                                        <span className="text-[10px] text-muted-foreground">{timeSince(comment.createdAt)}</span>
                                      </div>
                                      <p className="text-sm opacity-90">{comment.content}</p>
                                      <div className="flex items-center gap-3 mt-2">
                                        <button
                                          onClick={() => handleToggleLike(comment.id, true)}
                                          className={`text-xs font-medium flex items-center gap-1 ${comment.likes.includes(user?.uid || '') ? 'text-rose-500' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                          <Heart className={`h-3 w-3 ${comment.likes.includes(user?.uid || '') ? 'fill-current' : ''}`} />
                                          {comment.likes.length || ''}
                                        </button>
                                        {user?.uid === comment.authorId && (
                                          <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="text-xs font-medium text-muted-foreground hover:text-destructive flex items-center gap-1"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center text-sm text-muted-foreground py-2">{t('community.no_comments', 'No comments yet. Start the conversation!')}</p>
                            )}

                            <form onSubmit={(e) => handleAddComment(e, post.id)} className="mt-4 pt-4 border-t border-border/30">
                              <div className="flex items-start gap-3">
                                <div className="flex-1 space-y-2">
                                  <textarea
                                    name="comment-content"
                                    placeholder={t('community.reply_placeholder', 'Write a supportive reply...')}
                                    rows={2}
                                    required
                                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-inner placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                  <div className="flex items-center justify-between pl-1">
                                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                      <input type="checkbox" name="comment-anonymous" className="rounded bg-secondary/50 border-border/50 text-primary focus:ring-primary shadow-sm" />
                                      {t('community.reply_anonymously', 'Reply anonymously')}
                                    </label>
                                    <Button type="submit" size="sm" className="rounded-full px-5">{t('common.reply', 'Reply')}</Button>
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  icon={Users}
                  title={searchQuery || selectedCategory !== 'All' ? t('community.empty_search_title', "No posts found") : t('community.empty_title', "Welcome to the Community!")}
                  description={searchQuery || selectedCategory !== 'All'
                    ? t('community.empty_search_desc', "Try adjusting your search terms or category filter.")
                    : t('community.empty_desc', "No posts yet. Be the first to share a story, ask a question, or offer support.")}
                  ctaText={t('community.write_post', "Write a Post")}
                  ctaAction={() => setIsModalOpen(true)}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal title={t('community.modal_title', 'Create a New Post')} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form className="space-y-5" onSubmit={handleAddPost}>
          <div>
            <label htmlFor="post-title" className="block text-sm font-medium text-foreground mb-1">{t('community.post_title_label', 'Title')}</label>
            <Input id="post-title" name="post-title" placeholder={t('community.post_title_placeholder', 'A clear, concise title')} required />
          </div>

          <div>
            <label htmlFor="post-category" className="block text-sm font-medium text-foreground mb-1">{t('community.post_category_label', 'Category')}</label>
            <select
              id="post-category"
              name="post-category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{t(`community.category.${cat.toLowerCase().replace(' ', '_')}`, cat)}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="post-content" className="block text-sm font-medium text-foreground mb-1">{t('community.post_content_label', 'Your Story or Question')}</label>
            <textarea
              id="post-content"
              name="post-content"
              rows={6}
              placeholder={t('community.post_content_placeholder', 'Share your experiences, ask a question, or offer support to others in the community...')}
              required
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              <input type="checkbox" name="post-anonymous" className="rounded w-4 h-4 bg-secondary/50 border-border/50 text-primary focus:ring-primary shadow-sm cursor-pointer" />
              {t('community.post_anonymous', 'Post anonymously (Your identity will be hidden)')}
            </label>
          </div>

          <div>
            <label htmlFor="post-image" className="block text-sm font-medium text-foreground mb-1">{t('community.image_label', 'Attach Image (optional)')}</label>
            <input
              type="file"
              id="post-image"
              name="post-image"
              accept="image/*"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
            <Button type="submit" variant="gradient">{t('community.publish_post', 'Publish Post')}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Community;
