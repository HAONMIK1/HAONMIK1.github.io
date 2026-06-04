import ReviewCard from "../ReviewCard";
import bibimbapImage from "@assets/generated_images/Bibimbap_stone_bowl_dish_f859dd5c.png";
import tteokbokkiImage from "@assets/generated_images/Tteokbokki_street_food_photo_52e3ae17.png";
import chickenImage from "@assets/generated_images/Korean_fried_chicken_dish_86a8b635.png";

export default function ReviewCardExample() {
  return (
    <div className="p-4 max-w-2xl">
      <ReviewCard
        id="review1"
        author={{
          name: "이지은",
          hasLicense: true,
        }}
        restaurantName="서울 비빔밥"
        rating={5}
        content="정말 맛있어요! 돌솥이 뜨거워서 밥이 누룽지처럼 바삭하고, 고추장 양념이 일품입니다. 재방문 의사 100%!"
        photos={[bibimbapImage, tteokbokkiImage, chickenImage]}
        timestamp="2시간 전"
        likes={24}
        comments={5}
        hashtags={["돌솥비빔밥", "맛집인정", "재방문각"]}
      />
    </div>
  );
}
