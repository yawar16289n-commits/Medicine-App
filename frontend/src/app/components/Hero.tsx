export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 py-24">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* Left Text */}
        <div>
          <h2 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900">
            Learn without limits
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Access world-class learning from universities and companies. Earn professional certificates and degrees online while working toward your personal and professional goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button className="bg-blue-600 text-white px-8 py-3 rounded font-medium hover:bg-blue-700 transition">
              Explore Courses
            </button>
            <button className="border-2 border-gray-300 text-gray-900 px-8 py-3 rounded font-medium hover:bg-gray-100 transition">
              Try for Free
            </button>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1516534775068-bb57d973e671?w=600&h=400&fit=crop&q=80"
            alt="Learning"
            className="rounded-2xl shadow-2xl w-full h-auto"
          />
        </div>

      </div>
    </section>
  );
}
