import RestaurantCard from "../RestaurantCard";

const kbbqImage = "/generated_images/Korean_BBQ_galbi_food_photo_1abb752a.png";

export default function RestaurantCardExample() {
  return (
    <div className="p-4 max-w-md">
      <RestaurantCard
        id="rest1"
        name="강남 갈비집"
        category="한식"
        imageUrl={kbbqImage}
        rating={4.5}
        priceRange="₩₩₩"
        address="서울 강남구 테헤란로"
        author={{
          name: "김민수",
          hasLicense: true,
        }}
        onClick={() => {}}
      />
    </div>
  );
}
