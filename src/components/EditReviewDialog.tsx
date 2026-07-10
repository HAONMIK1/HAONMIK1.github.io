import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "./StarRating";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EditReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: number;
  initialContent: string;
  initialRating: number;
  initialImageUrls: string[];
  onUpdated?: () => void;
}

export default function EditReviewDialog({
  open,
  onOpenChange,
  reviewId,
  initialContent,
  initialRating,
  initialImageUrls,
  onUpdated,
}: EditReviewDialogProps) {
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [rating, setRating] = useState(initialRating);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setContent(initialContent);
      setRating(initialRating);
    }
  }, [open, initialContent, initialRating]);

  const handleSubmit = async () => {
    if (!rating) {
      toast({ title: "별점을 선택해주세요", variant: "destructive" });
      return;
    }
    if (!content.trim()) {
      toast({ title: "후기를 입력해주세요", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("PATCH", `/api/v1/reviews/${reviewId}`, {
        content: content.trim(),
        rating,
        imageUrls: initialImageUrls,
      });
      toast({ title: "후기를 수정했어요" });
      onOpenChange(false);
      onUpdated?.();
    } catch (error) {
      toast({
        title: "수정 실패",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-edit-review">
        <DialogHeader>
          <DialogTitle>후기 수정</DialogTitle>
          <DialogDescription>별점과 후기 내용을 수정할 수 있어요</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>별점</Label>
            <StarRating rating={rating} size="lg" interactive onRatingChange={setRating} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-review-content">후기 내용</Label>
            <Textarea
              id="edit-review-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none"
              data-testid="textarea-edit-review"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
            data-testid="button-submit-edit-review"
          >
            {isSubmitting ? "저장 중..." : "저장하기"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
