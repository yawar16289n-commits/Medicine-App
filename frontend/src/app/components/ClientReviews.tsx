export default function ClientReviews() {
  const reviews = [
    {
      name: "Sarah Chen",
      role: "Data Scientist at Google",
      company: "Google",
      rating: 5,
      quote: "Coursera helped me transition into a tech career. The courses are high quality and the instructors are experts in their fields.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80"
    },
    {
      name: "James Rodriguez",
      role: "Product Manager at Amazon",
      company: "Amazon",
      rating: 5,
      quote: "The structured learning paths on Coursera made it easy for me to upskill and get promoted. Highly recommend!",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80"
    },
    {
      name: "Emily Watson",
      role: "Business Analyst at Microsoft",
      company: "Microsoft",
      rating: 5,
      quote: "The certificates from Coursera are recognized by major employers. It's a great investment in your future.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80"
    },
    {
      name: "Marcus Johnson",
      role: "Software Engineer at Meta",
      company: "Meta",
      rating: 5,
      quote: "Learning at my own pace with Coursera allowed me to balance work and education perfectly. Amazing platform!",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="mb-12 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Trusted by millions of learners worldwide
          </h3>
          <p className="text-lg text-gray-600">
            See how Coursera has transformed careers and opened new opportunities
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {reviews.map((review, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, j) => (
                  <svg key={j} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 text-lg mb-6 italic">
                "{review.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img 
                  src={review.image}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{review.name}</h4>
                  <p className="text-sm text-gray-600">{review.role}</p>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Stats Below Reviews */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">150M+</div>
            <p className="text-gray-600">Active learners</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
            <p className="text-gray-600">Recommend Coursera</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">89%</div>
            <p className="text-gray-600">Report career benefits</p>
          </div>
        </div>

      </div>
    </section>
  );
}
