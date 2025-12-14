import Image from 'next/image';
import StatsSection from './StatsSection';

export default function ClientReviews() {
  const reviews = [
    {
      name: "Sarah Chen",
      role: "Data Scientist at Google",
      company: "Google",
      rating: 5,
      quote: "Coursera helped me transition into a tech career. The courses are high quality and the instructors are experts in their fields.",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%234F46E5'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3ESC%3C/text%3E%3C/svg%3E"
    },
    {
      name: "James Rodriguez",
      role: "Product Manager at Amazon",
      company: "Amazon",
      rating: 5,
      quote: "The structured learning paths on Coursera made it easy for me to upskill and get promoted. Highly recommend!",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2310B981'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3EJR%3C/text%3E%3C/svg%3E"
    },
    {
      name: "Emily Watson",
      role: "Business Analyst at Microsoft",
      company: "Microsoft",
      rating: 5,
      quote: "The certificates from Coursera are recognized by major employers. It's a great investment in your future.",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23F59E0B'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3EEW%3C/text%3E%3C/svg%3E"
    },
    {
      name: "Marcus Johnson",
      role: "Software Engineer at Meta",
      company: "Meta",
      rating: 5,
      quote: "Learning at my own pace with Coursera allowed me to balance work and education perfectly. Amazing platform!",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23EF4444'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3EMJ%3C/text%3E%3C/svg%3E"
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
              
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, j) => (
                  <svg key={j} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>

              <p className="text-gray-700 text-lg mb-6 italic">
                &quot;{review.quote}&quot;
              </p>

              <div className="flex items-center gap-4">
                <Image 
                  src={review.image}
                  alt={review.name}
                  width={48}
                  height={48}
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

        <StatsSection 
          className="mt-16"
          stats={[
            { value: '150M+', label: 'Active learners' },
            { value: '95%', label: 'Recommend Coursera' },
            { value: '89%', label: 'Report career benefits' }
          ]} 
        />

      </div>
    </section>
  );
}
