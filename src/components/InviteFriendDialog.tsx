import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2, MessageCircle } from "lucide-react";

interface InviteFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InviteFriendDialog({
  open,
  onOpenChange,
}: InviteFriendDialogProps) {
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    if (open && !inviteCode) {
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setInviteCode(randomCode);
    }
  }, [open]);

  const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;

  const inviteMessage = `함께 맛집을 탐험해요!

낙낙에서 진짜 맛집을 발견하고,
친구들과 함께 나만의 맛집 지도를 만들어가요.

당신만을 위한 특별한 초대
첫 가입 시 특별 혜택 제공

지금 바로 시작해보세요!
${inviteUrl}

낙낙 맛집추천 맛집탐방 친구초대`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "초대코드 복사 완료",
      description: "친구에게 공유해보세요!",
    });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(inviteMessage);
    toast({
      title: "초대 메시지 복사 완료",
      description: "카카오톡이나 메시지로 공유해보세요!",
    });
  };

  const handleShareKakao = () => {
    const kakaoUrl = `https://open.kakao.com/o/`;
    const message = encodeURIComponent(inviteMessage);
    const shareUrl = `kakaolink://send?msg=${message}`;
    
    try {
      window.location.href = shareUrl;
    } catch (error) {
      navigator.clipboard.writeText(inviteMessage);
      toast({
        title: "메시지 복사 완료",
        description: "카카오톡에서 직접 붙여넣기 해주세요!",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-invite-friend">
        <DialogHeader>
          <DialogTitle className="text-xl">친구 초대하기</DialogTitle>
          <DialogDescription>
            친구를 초대하고 함께 맛집을 탐험하세요!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 초대 코드 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              내 초대 코드
            </label>
            <div className="flex gap-2">
              <Input
                value={inviteCode}
                readOnly
                className="flex-1 font-mono text-lg text-center bg-muted"
                data-testid="input-invite-code"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                data-testid="button-copy-code"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 초대 메시지 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              초대 메시지
            </label>
            <div className="relative">
              <textarea
                value={inviteMessage}
                readOnly
                className="w-full h-64 p-3 text-sm border rounded-lg bg-muted/50 resize-none"
                data-testid="textarea-invite-message"
              />
            </div>
          </div>

          {/* 공유 버튼들 */}
          <div className="flex gap-2">
            <Button
              variant="default"
              className="flex-1 gap-2"
              onClick={handleShareKakao}
              data-testid="button-share-kakao"
            >
              <MessageCircle className="w-4 h-4" />
              카카오톡 공유
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleCopyMessage}
              data-testid="button-copy-message"
            >
              <Copy className="w-4 h-4" />
              메시지 복사
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            초대한 친구가 가입하면 1촌으로 자동 연결됩니다
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
