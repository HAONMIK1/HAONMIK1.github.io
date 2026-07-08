import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentNickname: string;
  onSave?: (nickname: string) => void;
}

export default function EditProfileDialog({
  open,
  onOpenChange,
  currentNickname,
  onSave,
}: EditProfileDialogProps) {
  const [nickname, setNickname] = useState(currentNickname);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setNickname(currentNickname);
    }
  }, [open, currentNickname]);

  const handleSave = () => {
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      toast({
        title: "닉네임을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
      toast({
        title: "닉네임은 2-10자로 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    onSave?.(trimmedNickname);

    toast({
      title: "프로필이 수정되었습니다",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-edit-profile">
        <DialogHeader>
          <DialogTitle>프로필 수정</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="2-10자로 입력해주세요"
              maxLength={10}
              data-testid="input-nickname"
            />
            <p className="text-xs text-muted-foreground">
              {nickname.trim().length}/10자
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            data-testid="button-save"
          >
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
