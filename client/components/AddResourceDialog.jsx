"use client";
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import axios from 'axios';

export function AddResourceDialog({ 
  open, 
  onClose, 
  section, 
  courseName, 
  onAdd,
  onLocalAdd
}) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { user } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!user?.primaryEmailAddress?.emailAddress) {
      toast.error("Please log in to add a resource");
      return;
    }

    try {
      setIsSubmitting(true);

      const newResource = {
        id: Date.now(), 
        title: title.trim(),
        content: content.trim(),
        section: section === 'teacher_resources' ? 'teacher_resources' : 'student_resources',
        author_name: user.fullName,
        author_avatar: user.imageUrl,
        is_favorited: false,
        favorites: 0,
        createdAt: new Date().toISOString()
      };

   
      onLocalAdd(newResource);

      
      await onAdd(newResource);

      setTitle("");
      setContent("");
      onClose();
    } catch (error) {
      console.error("Error adding resource:", error);
      toast.error(error.response?.data?.error || "Failed to add resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!open) {
      setTitle("");
      setContent("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Add New {section === "teacher_resources" ? "Teacher" : "Student"} Resource
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter resource title"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter resource content"
              className="min-h-[100px]"
              disabled={isSubmitting}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}