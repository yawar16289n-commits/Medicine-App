'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';

const coursesData = {
  '1': {
    id: '1',
    title: 'Data Science',
    instructor: 'Dr. Rachele Tongchitpakdee',
    company: 'University of Colorado Boulder',
    rating: 4.7,
    reviews: 3245,
    students: 185000,
    price: 49,
    originalPrice: 99,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop&q=80',
    description: 'Learn data science fundamentals including statistical analysis, data visualization, and predictive modeling.',
    duration: '4-5 months',
    level: 'Beginner',
    language: 'English',
    subtitles: ['English', 'Spanish', 'French', 'Chinese'],
    skills: ['Data Analysis', 'Python', 'Statistics', 'Visualization'],
    about: 'Master the core skills of data science. This comprehensive specialization covers data collection, cleaning, analysis, and visualization. You\'ll learn to work with real datasets and build predictive models using Python.',
    instructor_bio: 'Dr. Rachele Tongchitpakdee is a professor of data science with 15+ years of industry experience. She has led data science teams at Fortune 500 companies.',
    instructor_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80',
    courses: [
      { number: 1, title: 'Data Fundamentals', lessons: 24, duration: '10 hours' },
      { number: 2, title: 'Statistical Analysis & Probability', lessons: 28, duration: '12 hours' },
      { number: 3, title: 'Data Visualization & Communication', lessons: 22, duration: '9 hours' },
      { number: 4, title: 'Predictive Modeling', lessons: 30, duration: '14 hours' }
    ],
    learningOutcomes: [
      'Master data cleaning and preprocessing techniques',
      'Perform statistical analysis and hypothesis testing',
      'Create compelling data visualizations',
      'Build predictive models using machine learning',
      'Work with real-world datasets',
      'Communicate data insights effectively'
    ]
  },
  '2': {
    id: '2',
    title: 'Web Development with React',
    instructor: 'Meta Developers',
    company: 'Meta',
    rating: 4.8,
    reviews: 4156,
    students: 225000,
    price: 49,
    originalPrice: 99,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop&q=80',
    description: 'Build modern web applications with React. Learn component-based architecture, state management, and advanced patterns.',
    duration: '3-4 months',
    level: 'Intermediate',
    language: 'English',
    subtitles: ['English', 'Spanish', 'German', 'Japanese'],
    skills: ['React', 'JavaScript', 'Web Development', 'CSS'],
    about: 'Learn to build scalable web applications with React from Meta engineers. This course covers modern JavaScript, React fundamentals, state management with Redux, and testing practices.',
    instructor_bio: 'The Meta Developers program is led by experienced engineers from Meta who have built production-grade React applications serving billions of users.',
    instructor_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
    courses: [
      { number: 1, title: 'JavaScript Fundamentals', lessons: 32, duration: '14 hours' },
      { number: 2, title: 'React Basics & Components', lessons: 36, duration: '16 hours' },
      { number: 3, title: 'State Management & APIs', lessons: 28, duration: '12 hours' },
      { number: 4, title: 'Advanced React Patterns', lessons: 24, duration: '11 hours' }
    ],
    learningOutcomes: [
      'Master modern JavaScript ES6+ syntax',
      'Build reusable React components',
      'Manage application state effectively',
      'Integrate with REST and GraphQL APIs',
      'Implement authentication and authorization',
      'Deploy React applications to production'
    ]
  },
  '3': {
    id: '3',
    title: 'Machine Learning Specialization',
    instructor: 'Andrew Ng',
    company: 'DeepLearning.AI',
    rating: 4.9,
    reviews: 5234,
    students: 350000,
    price: 49,
    originalPrice: 99,
    image: 'https://images.unsplash.com/photo-1518432031498-7794beeba4c0?w=800&h=400&fit=crop&q=80',
    description: 'Learn Machine Learning from the best in the field. This specialization covers the fundamentals of machine learning and deep learning.',
    duration: '3-4 months',
    level: 'Beginner',
    language: 'English',
    subtitles: ['English', 'Spanish', 'French', 'Mandarin'],
    skills: ['Machine Learning', 'Python', 'Neural Networks', 'Deep Learning'],
    about: 'Master Machine Learning fundamentals and build your career in AI. Learn supervised learning, unsupervised learning, and reinforcement learning. This comprehensive specialization will equip you with the skills to understand and apply machine learning techniques to real-world problems.',
    instructor_bio: 'Andrew Ng is the Co-founder of Coursera and an Adjunct Professor of Computer Science at Stanford University. He has published over 100 research papers in machine learning.',
    instructor_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
    courses: [
      { number: 1, title: 'Supervised Machine Learning: Regression and Classification', lessons: 27, duration: '12 hours' },
      { number: 2, title: 'Advanced Learning Algorithms', lessons: 34, duration: '15 hours' },
      { number: 3, title: 'Unsupervised Learning, Recommenders, Reinforcement Learning', lessons: 31, duration: '14 hours' }
    ],
    learningOutcomes: [
      'Understand the core concepts of machine learning and how to apply them',
      'Build and train neural networks using TensorFlow',
      'Implement supervised and unsupervised learning algorithms',
      'Apply machine learning to real-world problems and datasets',
      'Develop practical machine learning projects',
      'Master Python programming for machine learning'
    ]
  },
  '4': {
    id: '4',
    title: 'UI/UX Design',
    instructor: 'Google Design Team',
    company: 'Google',
    rating: 4.7,
    reviews: 2891,
    students: 156000,
    price: 39,
    originalPrice: 79,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop&q=80',
    description: 'Learn user-centered design principles and create beautiful, functional interfaces.',
    duration: '5-6 months',
    level: 'Beginner',
    language: 'English',
    subtitles: ['English', 'Spanish', 'Korean', 'Portuguese'],
    skills: ['Design Thinking', 'Figma', 'Wireframing', 'Prototyping'],
    about: 'Develop a foundation in user-centered design. Learn to create wireframes, prototypes, and high-fidelity designs. Understand user research, usability testing, and design thinking methodologies.',
    instructor_bio: 'Google Design Team brings expertise from designing products used by billions. Learn best practices from industry leaders.',
    instructor_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
    courses: [
      { number: 1, title: 'Foundations of User Experience Design', lessons: 25, duration: '11 hours' },
      { number: 2, title: 'UX Research & Testing', lessons: 22, duration: '10 hours' },
      { number: 3, title: 'Visual Design & Branding', lessons: 28, duration: '12 hours' },
      { number: 4, title: 'Interaction Design & Prototyping', lessons: 26, duration: '11 hours' }
    ],
    learningOutcomes: [
      'Apply design thinking principles to real-world problems',
      'Conduct user research and competitive analysis',
      'Create wireframes and prototypes',
      'Master Figma for UI design',
      'Perform usability testing and gather feedback',
      'Build a professional design portfolio'
    ]
  },
  '5': {
    id: '5',
    title: 'Business Strategy',
    instructor: 'Prof. Michael Porter',
    company: 'Harvard Business School',
    rating: 4.6,
    reviews: 1834,
    students: 98000,
    price: 59,
    originalPrice: 119,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80',
    description: 'Master business strategy, competitive analysis, and strategic planning.',
    duration: '6 months',
    level: 'Intermediate',
    language: 'English',
    subtitles: ['English', 'Spanish', 'French', 'Mandarin'],
    skills: ['Strategic Planning', 'Business Analysis', 'Leadership', 'Finance'],
    about: 'Learn strategic management from Harvard Business School instructors. Understand competitive positioning, value creation, and strategic decision-making in modern business.',
    instructor_bio: 'Prof. Michael Porter is the leading authority on strategy and competitiveness. His frameworks are used by companies worldwide.',
    instructor_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
    courses: [
      { number: 1, title: 'Business Fundamentals', lessons: 20, duration: '9 hours' },
      { number: 2, title: 'Competitive Strategy', lessons: 24, duration: '11 hours' },
      { number: 3, title: 'Financial Analysis for Managers', lessons: 26, duration: '12 hours' },
      { number: 4, title: 'Strategic Implementation', lessons: 22, duration: '10 hours' }
    ],
    learningOutcomes: [
      'Analyze industry competitive dynamics',
      'Develop strategic plans for organizations',
      'Understand financial statements and metrics',
      'Build sustainable competitive advantages',
      'Lead organizational change',
      'Make data-driven strategic decisions'
    ]
  },
  '6': {
    id: '6',
    title: 'Artificial Intelligence',
    instructor: 'Dr. Yann LeCun',
    company: 'Meta AI',
    rating: 4.8,
    reviews: 3567,
    students: 267000,
    price: 59,
    originalPrice: 119,
    image: 'https://images.unsplash.com/photo-1677442d019cecf367cde4fdb3fc4e15?w=800&h=400&fit=crop&q=80',
    description: 'Explore cutting-edge AI and deep learning technologies.',
    duration: '4-5 months',
    level: 'Advanced',
    language: 'English',
    subtitles: ['English', 'Spanish', 'German', 'Chinese'],
    skills: ['Deep Learning', 'PyTorch', 'Computer Vision', 'NLP'],
    about: 'Master advanced AI and deep learning with world-class instructors. Learn neural networks, computer vision, natural language processing, and cutting-edge AI applications.',
    instructor_bio: 'Dr. Yann LeCun is Chief AI Scientist at Meta and a pioneer in deep learning. He has made fundamental contributions to artificial intelligence.',
    instructor_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
    courses: [
      { number: 1, title: 'Deep Learning Fundamentals', lessons: 32, duration: '15 hours' },
      { number: 2, title: 'Computer Vision', lessons: 28, duration: '13 hours' },
      { number: 3, title: 'Natural Language Processing', lessons: 30, duration: '14 hours' },
      { number: 4, title: 'Advanced AI Applications', lessons: 26, duration: '12 hours' }
    ],
    learningOutcomes: [
      'Build and train deep neural networks',
      'Implement computer vision models',
      'Develop NLP applications',
      'Understand transformers and attention mechanisms',
      'Deploy AI models to production',
      'Stay updated with latest AI research'
    ]
  },
  '7': {
    id: '7',
    title: 'Cloud Computing',
    instructor: 'AWS Architects',
    company: 'Amazon Web Services',
    rating: 4.7,
    reviews: 2456,
    students: 178000,
    price: 49,
    originalPrice: 99,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop&q=80',
    description: 'Learn cloud architecture and AWS services for building scalable applications.',
    duration: '3-4 months',
    level: 'Intermediate',
    language: 'English',
    subtitles: ['English', 'Spanish', 'French', 'Italian'],
    skills: ['AWS', 'Cloud Architecture', 'DevOps', 'Scalability'],
    about: 'Master cloud computing with AWS. Learn to design, deploy, and manage scalable cloud applications. Understand microservices, containers, and serverless computing.',
    instructor_bio: 'AWS Architects bring real-world cloud expertise from building enterprise solutions at Amazon.',
    instructor_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
    courses: [
      { number: 1, title: 'AWS Fundamentals', lessons: 28, duration: '12 hours' },
      { number: 2, title: 'Compute & Storage Services', lessons: 30, duration: '14 hours' },
      { number: 3, title: 'Databases & Networking', lessons: 26, duration: '12 hours' },
      { number: 4, title: 'Security & Scaling', lessons: 24, duration: '11 hours' }
    ],
    learningOutcomes: [
      'Design scalable cloud architectures',
      'Master EC2, S3, and RDS services',
      'Implement auto-scaling and load balancing',
      'Secure cloud applications and data',
      'Deploy with CI/CD pipelines',
      'Optimize cloud costs'
    ]
  }
};

export default function CourseDetail() {
  const params = useParams();
  const courseId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');

  const course = coursesData[courseId as keyof typeof coursesData] || coursesData['1'];

  return (
    <main className="min-h-screen bg-white">
      <header className="w-full border-b bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">Coursera</h1>
          </Link>
          <div className="flex items-center gap-6">
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold cursor-pointer">
              U
            </div>
          </div>
        </div>
      </header>

      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex gap-3 mb-4">
              <span className="inline-block px-3 py-1 bg-blue-800 rounded-full text-sm font-medium">
                {course.level}
              </span>
              <span className="inline-block px-3 py-1 bg-blue-800 rounded-full text-sm font-medium">
                {course.duration}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-blue-100 mb-6">{course.description}</p>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <span className="font-semibold">{course.rating}</span>
                <span className="text-gray-300">({course.reviews.toLocaleString()} reviews)</span>
              </div>
              <div className="text-gray-300">
                {course.students.toLocaleString()} students
              </div>
            </div>

            <div className="flex items-center gap-3">
              <img src={course.instructor_image} alt={course.instructor} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold">Instructor: {course.instructor}</p>
                <p className="text-blue-200 text-sm">{course.company}</p>
              </div>
            </div>
          </div>

          <div className="bg-white text-gray-900 rounded-lg p-6 h-fit">
            <img src={course.image} alt={course.title} className="w-full h-40 object-cover rounded-lg mb-4" />
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 line-through text-lg">${course.originalPrice}</p>
                <p className="text-3xl font-bold text-blue-600">${course.price}</p>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
                Enroll Now
              </button>

              <button className="w-full border-2 border-gray-300 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-50">
                Save
              </button>

              <div className="space-y-2 text-sm text-gray-600 pt-4 border-t border-gray-200">
                <p>✓ Access on mobile and desktop</p>
                <p>✓ 30-day money-back guarantee</p>
                <p>✓ Beginner level</p>
                <p>✓ {course.duration}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {['Overview', 'Curriculum', 'Reviews', 'About Instructor'].map((tab) => (
              <button
                key={tab.toLowerCase()}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`py-4 border-b-2 font-medium transition ${
                  activeTab === tab.toLowerCase()
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About this course</h2>
                  <p className="text-gray-700 leading-relaxed">{course.about}</p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">What you'll learn</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.learningOutcomes.map((outcome, i) => (
                      <div key={i} className="flex gap-3">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                        <p className="text-gray-700">{outcome}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills you'll gain</h2>
                  <div className="flex flex-wrap gap-3">
                    {course.skills.map((skill, i) => (
                      <span key={i} className="px-4 py-2 bg-gray-200 text-gray-900 rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Curriculum</h2>
                {course.courses.map((module, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Course {module.number}: {module.title}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {module.lessons} lessons • {module.duration}
                        </p>
                      </div>
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-gray-200 pb-6">
                    <div className="flex items-start gap-4">
                      <img src={`https://images.unsplash.com/photo-150000${i}211169-0a1dd7228f2d?w=50&h=50&fit=crop&q=80`} 
                        alt="Reviewer" className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">Student Name</p>
                            <p className="text-sm text-gray-600">Verified Learner</p>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <svg key={j} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">This is an excellent course with comprehensive content and great instructors. Highly recommended for anyone interested in machine learning!</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="flex gap-6">
                  <img src={course.instructor_image} alt={course.instructor} 
                    className="w-24 h-24 rounded-full object-cover" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{course.instructor}</h2>
                    <p className="text-gray-600">{course.company}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {course.instructor_bio}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Course Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Level</p>
                  <p className="font-medium text-gray-900">{course.level}</p>
                </div>
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900">{course.duration}</p>
                </div>
                <div>
                  <p className="text-gray-600">Language</p>
                  <p className="font-medium text-gray-900">{course.language}</p>
                </div>
                <div>
                  <p className="text-gray-600">Subtitles</p>
                  <p className="font-medium text-gray-900">{course.subtitles.join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Share</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-gray-900 font-medium">Facebook</span>
                </button>
                <button className="w-full flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7a10.6 10.6 0 01-9 5c3 1.5 7 1.5 9 0"/>
                  </svg>
                  <span className="text-gray-900 font-medium">Twitter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
