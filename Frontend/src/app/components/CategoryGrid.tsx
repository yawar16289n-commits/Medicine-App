import CourseCard from "./CourseCard";

const categories = [
  { id: "1", title: "Data Science", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%234F46E5' width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' fill='white' text-anchor='middle' dominant-baseline='middle'%3EData Science%3C/text%3E%3C/svg%3E" },
  { id: "2", title: "Web Development", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%2310B981' width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' fill='white' text-anchor='middle' dominant-baseline='middle'%3EWeb Dev%3C/text%3E%3C/svg%3E" },
  { id: "3", title: "Machine Learning", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23F59E0B' width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' fill='white' text-anchor='middle' dominant-baseline='middle'%3EML%3C/text%3E%3C/svg%3E" },
  { id: "4", title: "Graphic Design", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23EF4444' width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' fill='white' text-anchor='middle' dominant-baseline='middle'%3EDesign%3C/text%3E%3C/svg%3E" },
  { id: "5", title: "Business Strategy", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%238B5CF6' width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' fill='white' text-anchor='middle' dominant-baseline='middle'%3EBusiness%3C/text%3E%3C/svg%3E" },
  { id: "6", title: "AI Engineering", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%2306B6D4' width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' fill='white' text-anchor='middle' dominant-baseline='middle'%3EAI%3C/text%3E%3C/svg%3E" },
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
