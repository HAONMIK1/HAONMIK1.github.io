import { useEffect, useRef, useState } from "react";
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
import { ImagePlus, X } from "lucide-react";

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
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(initialImageUrls);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setContent(initialContent);
      setRating(initialRating);
      setExistingImageUrls(initialImageUrls);
      setNewFiles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const newFilePreviews = newFiles.map((file) => URL.createObjectURL(file));
  useEffect(() => {
    return () => newFilePreviews.forEach((url) => URL.revokeObjectURL(url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newFiles]);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    setNewFiles((prev) => [...prev, ...Array.from(files)]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveExisting = (url: string) => {
    setExistingImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

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
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        const form = new FormData();
        newFiles.forEach((file) => form.append("files", file));
        const uploadRes = await apiRequest("POST", "/api/v1/uploads/images", form);
        const uploadBody = await uploadRes.json();
        uploadedUrls = uploadBody.data ?? [];
      }

      await apiRequest("PATCH", `/api/v1/reviews/${reviewId}`, {
        content: content.trim(),
        rating,
        imageUrls: [...existingImageUrls, ...uploadedUrls],
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
          <DialogDescription>별점, 후기 내용, 사진을 수정할 수 있어요</DialogDescription>
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

          <div className="space-y-2">
            <Label>사진</Label>
            <div className="flex flex-wrap gap-2">
              {existingImageUrls.map((url) => (
                <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden" data-testid={`edit-existing-photo-${url}`}>
                  <img src={url} alt="후기 사진" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExisting(url)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                    aria-label="사진 삭제"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {newFilePreviews.map((url, idx) => (
                <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden" data-testid={`edit-new-photo-${idx}`}>
                  <img src={url} alt="새 사진" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewFile(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                    aria-label="사진 삭제"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover-elevate"
                data-testid="button-edit-add-photo"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-[11px]">사진 추가</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
            </div>
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
