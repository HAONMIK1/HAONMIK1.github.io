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
import { apiRequest } from "@/lib/queryClient";
import { Copy, Share2, MessageCircle, Loader2 } from "lucide-react";

interface InviteFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InviteFriendDialog({ open, onOpenChange }: InviteFriendDialogProps) {
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && !inviteCode) {
      fetchInviteCode();
    }
  }, [open]);

  const fetchInviteCode = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("GET", "/api/v1/users/me");
      const body = await response.json();
      if (body.data?.inviteCode) {
        setInviteCode(body.data.inviteCode);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;

  const inviteMessage = `지인들이 진짜 다녀온 맛집, 궁금하지 않아?\n\n낙낙은 지인이 직접 가본 맛집만 모아 보여주는 앱이야.\n지인들의 맛집이 궁금하면 아래 링크로 들어와.\n초대 링크: ${inviteUrl}\n\n(이 글을 보고 가입 안 하면... 여러분의 맛집 도전은 실패하길 기원합니다 👻)`;

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(inviteCode);
    toast({ title: "초대코드 복사 완료", description: "지인에게 공유해보세요!" });
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    toast({ title: "초대 링크 복사 완료", description: "지인에게 링크를 공유해보세요!" });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "낙낙 지인 초대",
          text: inviteMessage,
          url: inviteUrl,
        });
        return;
      } catch {}
    }
    // Web Share API 미지원 시 클립보드 복사
    await navigator.clipboard.writeText(inviteMessage);
    toast({ title: "초대 메시지 복사 완료", description: "카카오톡이나 메시지로 공유해보세요!" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-invite-friend">
        <DialogHeader>
          <DialogTitle className="text-xl">지인 초대하기</DialogTitle>
          <DialogDescription>지인을 초대하고 진짜 맛집을 함께 나눠보세요!</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* 초대 코드 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">내 초대 코드</label>
            <div className="flex gap-2">
              {isLoading ? (
                <div className="flex-1 h-10 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Input
                  value={inviteCode}
                  readOnly
                  className="flex-1 font-mono text-lg text-center tracking-widest bg-muted"
                  data-testid="input-invite-code"
                />
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                disabled={!inviteCode || isLoading}
                data-testid="button-copy-code"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 초대 링크 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">초대 링크</label>
            <div className="flex gap-2">
              <Input
                value={isLoading ? "링크 불러오는 중..." : inviteUrl}
                readOnly
                className="flex-1 text-xs bg-muted text-muted-foreground"
                data-testid="input-invite-url"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                disabled={!inviteCode || isLoading}
                data-testid="button-copy-link"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 공유 버튼들 */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="default"
              className="gap-2"
              style={{ backgroundColor: "#FEE500", color: "#000" }}
              onClick={handleShare}
              disabled={!inviteCode || isLoading}
              data-testid="button-share-kakao"
            >
              <MessageCircle className="w-4 h-4" />
              카카오톡 공유
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleShare}
              disabled={!inviteCode || isLoading}
              data-testid="button-share-other"
            >
              <Share2 className="w-4 h-4" />
              다른 방법으로
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            초대한 지인이 가입하면 1촌으로 자동 연결돼요
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
