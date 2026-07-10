// 백엔드 Review는 content(문자열) 하나뿐이라, 추천메뉴/해시태그는 정해진 형식으로
// content 안에 합쳐서 저장한다. 등록/수정 화면에서 각각 입력받을 수 있도록
// 저장 전 합치고(format), 불러올 때 다시 분리한다(parse).
//
// 형식:
//   [추천메뉴: 김치찌개]
//   맛있어요 자주 갈 것 같아요
//   #데이트맛집

export interface ParsedReviewContent {
  recommendedMenu: string;
  review: string;
  hashtag: string;
}

export function parseReviewContent(content: string): ParsedReviewContent {
  const lines = content.split("\n");
  let recommendedMenu = "";
  let hashtag = "";
  const bodyLines: string[] = [];

  lines.forEach((line, index) => {
    const menuMatch = line.match(/^\[추천메뉴: (.+)\]$/);
    const isLastLine = index === lines.length - 1;
    const hashtagMatch = isLastLine ? line.match(/^#(.+)$/) : null;

    if (menuMatch) {
      recommendedMenu = menuMatch[1];
    } else if (hashtagMatch) {
      hashtag = hashtagMatch[1];
    } else {
      bodyLines.push(line);
    }
  });

  return {
    recommendedMenu,
    review: bodyLines.join("\n").trim(),
    hashtag,
  };
}

export function formatReviewContent(parts: ParsedReviewContent): string {
  const contentParts: string[] = [];
  if (parts.recommendedMenu.trim()) contentParts.push(`[추천메뉴: ${parts.recommendedMenu.trim()}]`);
  contentParts.push(parts.review.trim());
  if (parts.hashtag.trim()) contentParts.push(`#${parts.hashtag.trim()}`);
  return contentParts.join("\n");
}

export const SUGGESTED_HASHTAGS = [
  "데이트맛집", "혼밥", "가성비", "분위기맛집", "맛집투어", "인생맛집",
];
