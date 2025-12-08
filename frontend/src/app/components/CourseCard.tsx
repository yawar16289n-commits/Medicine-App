import Link from 'next/link';

export default function CourseCard({
  title,
  image,
  id = '1'
}: {
  title: string;
  image: string;
  id?: string;
}) {
  return (
    <Link href={`/course/${id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer group">
        <div className="relative overflow-hidden bg-gray-200 h-48">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        </div>
        
        <div className="p-5">
          <h4 className="text-lg font-bold text-gray-900 mb-2">{title}</h4>
          <p className="text-gray-600 text-sm mb-4">
            Learn in-demand skills from top-rated instructors
          </p>
          <div className="flex items-center text-blue-600 font-medium text-sm hover:text-blue-700">
            Explore <span className="ml-1">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
