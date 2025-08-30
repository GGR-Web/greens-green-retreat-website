
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, Edit, CheckCircle, CircleDotDashed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deletePost, updatePostStatus } from "./actions";

interface PostActionsProps {
    postId: string;
    postStatus: 'draft' | 'published';
}

export default function PostActions({ postId, postStatus }: PostActionsProps) {
    const { toast } = useToast();
    const [isDeletePending, startDeleteTransition] = useTransition();
    const [isStatusPending, startStatusTransition] = useTransition();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = () => {
        startDeleteTransition(async () => {
            const result = await deletePost(postId);
            if (result.error) {
                 toast({
                    title: "Deletion Failed",
                    description: result.error,
                    variant: "destructive"
                });
            } else {
                 toast({
                    title: "Post Deleted",
                    description: "The post has been successfully deleted.",
                });
            }
            setShowDeleteDialog(false);
        });
    }

    const handleStatusToggle = () => {
        const newStatus = postStatus === 'published' ? 'draft' : 'published';
        startStatusTransition(async () => {
            const result = await updatePostStatus(postId, newStatus);
             if (result.error) {
                 toast({
                    title: "Update Failed",
                    description: result.error,
                    variant: "destructive"
                });
            } else {
                 toast({
                    title: "Status Updated",
                    description: `Post has been set to ${newStatus}.`,
                });
            }
        });
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isStatusPending}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/journal/edit/${postId}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem onSelect={handleStatusToggle} disabled={isStatusPending}>
                        {postStatus === 'published' ? (
                            <>
                                <CircleDotDashed className="mr-2 h-4 w-4" />
                                <span>Unpublish</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                <span>Publish</span>
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Post
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will permanently delete this post. This cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeletePending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeletePending} className="bg-destructive hover:bg-destructive/90">
                        {isDeletePending ? "Deleting..." : "Yes, delete post"}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
