import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Users, Plus, Trash2 } from '../components/icons/Icons';
import { CommunityPost } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getCommunityPosts, addCommunityPost, deleteCommunityPost } from '../services/dataSupabase';
import { AnimatePresence, motion } from 'framer-motion';

const Community: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshPosts = useCallback(async () => {
    setIsLoading(true);
    const data = await getCommunityPosts();
    setPosts(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deleteCommunityPost(id);
      await refreshPosts();
    }
  };

  const handleAddPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !user.displayName) return;
    const formData = new FormData(e.currentTarget);
    const newPostData = {
        title: formData.get('post-title') as string,
        content: formData.get('post-content') as string,
    };
    if (newPostData.title && newPostData.content) {
        await addCommunityPost(user.uid, newPostData, { name: user.displayName, photoURL: user.photoURL });
        await refreshPosts();
        setIsModalOpen(false);
    }
  };
  
  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 5) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main feed */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <img src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}`} alt="Your avatar" className="w-10 h-10 rounded-full" />
                        <Button onClick={() => setIsModalOpen(true)} className="w-full justify-start text-left text-muted-foreground hover:text-foreground transition-colors" variant="outline">
                            What's on your mind, {user?.displayName?.split(' ')[0]}?
                        </Button>
                         <Button onClick={() => setIsModalOpen(true)} className="hidden sm:inline-flex">
                            <Plus className="mr-2 h-4 w-4" /> Post
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {isLoading ? (
                <Card>
                    <CardContent className="pt-6 text-center py-20">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-muted-foreground mt-4">Loading community posts...</p>
                    </CardContent>
                </Card>
            ) : posts.length > 0 ? (
            <AnimatePresence>
                {posts.map((post, index) => (
                <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                    <Card className="hover:border-primary/50 transition-all duration-300">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <img src={post.authorPhotoURL || `https://i.pravatar.cc/150?u=${post.authorId}`} alt={post.authorName} className="w-8 h-8 rounded-full" />
                                <div className="text-sm">
                                    <span className="font-semibold">{post.authorName}</span>
                                    <p className="text-muted-foreground text-xs">{timeSince(post.timestamp)}</p>
                                </div>
                            </div>
                             <CardTitle className="text-xl leading-tight">{post.title}</CardTitle>
                        </div>
                        {user && user.uid === post.authorId && (
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => handleDelete(post.id)}
                            aria-label="Delete post"
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                    </CardContent>
                    </Card>
                </motion.div>
                ))}
            </AnimatePresence>
            ) : (
            <Card>
                <CardContent className="pt-6 text-center py-20">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Welcome to the Community!</h3>
                <p className="text-muted-foreground mt-2">No posts yet. Be the first to share something!</p>
                </CardContent>
            </Card>
            )}
        </div>
        
        {/* Right Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24">
            <Card>
                <CardHeader>
                    <CardTitle>About HealthHub</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                    This is a safe space to share experiences, ask questions, and connect with others. Remember to be respectful and supportive. This is not a substitute for professional medical advice.
                    </p>
                </CardContent>
            </Card>
        </aside>
      </div>

      <Modal title="Create a New Post" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
         <form className="space-y-4" onSubmit={handleAddPost}>
            <div>
              <label htmlFor="post-title" className="block text-sm font-medium text-foreground mb-1">Title</label>
              <Input id="post-title" name="post-title" placeholder="A catchy title for your post" required />
            </div>
            <div>
              <label htmlFor="post-content" className="block text-sm font-medium text-foreground mb-1">Content</label>
              <textarea
                id="post-content"
                name="post-content"
                rows={5}
                placeholder="Share your story, ask a question, or offer support..."
                required
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
               <Button type="submit">Post</Button>
            </div>
         </form>
      </Modal>
    </>
  );
};

export default Community;
