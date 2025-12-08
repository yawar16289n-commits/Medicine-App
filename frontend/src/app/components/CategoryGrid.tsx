import CourseCard from "./CourseCard";

const categories = [
  { id: "1", title: "Data Science", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&q=80" },
  { id: "2", title: "Web Development", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=200&fit=crop&q=80" },
  { id: "3", title: "Machine Learning", image: "https://images.unsplash.com/photo-1518432031498-7794beeba4c0?w=300&h=200&fit=crop&q=80" },
  { id: "4", title: "Graphic Design", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop&q=80" },
  { id: "5", title: "Business Strategy", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop&q=80" },
  { id: "6", title: "AI Engineering", image: "https://images.unsplash.com/photo-1677442d019cecf8ccd410d1638a0218ba90ee301?w=300&h=200&fit=crop&q=80" },
];

export default function CategoryGrid() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Explore popular categories
          </h3>
          <p className="text-gray-600 text-lg">Trending skills with high demand and competitive salaries</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((item) => (
            <CourseCard key={item.id} id={item.id} title={item.title} image={item.image} />
          ))}
        </div>

      </div>
    </section>
  );
}
