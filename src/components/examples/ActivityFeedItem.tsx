import ActivityFeedItem from "../ActivityFeedItem";
import kbbqImage from "@assets/generated_images/Korean_BBQ_galbi_food_photo_1abb752a.png";

export default function ActivityFeedItemExample() {
  return (
    <div className="flex flex-col">
      <ActivityFeedItem
        id="act1"
        user={{ name: "김민수", hasLicense: true }}
        action="님이 후기를 남겼습니다:"
        target="강남 갈비집"
        timestamp="2시간 전"
        imageUrl={kbbqImage}
        onClick={() => {}}
      />
      <ActivityFeedItem
        id="act2"
        user={{ name: "이지은" }}
        action="님이 새 맛집을 등록했습니다:"
        target="홍대 떡볶이"
        timestamp="5시간 전"
      />
    </div>
  );
}
