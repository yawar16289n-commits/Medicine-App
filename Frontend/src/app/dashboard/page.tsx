'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import UserAvatar from '@/app/components/UserAvatar';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="w-full border-b bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">Coursera</h1>
          </Link>

          <div className="hidden md:flex flex-1 mx-8">
            <div className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for anything"
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
              <svg className="w-5 h-5 absolute right-4 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-600 hover:text-gray-900 hidden sm:block">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <UserAvatar />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, User!</h2>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <button className="px-4 py-3 border-b-2 border-blue-600 text-blue-600 font-medium">
            In Progress
          </button>
          <button className="px-4 py-3 text-gray-600 hover:text-gray-900 font-medium">
            Completed
          </button>
          <button className="px-4 py-3 text-gray-600 hover:text-gray-900 font-medium">
            Saved
          </button>
        </div>

        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Continuing Education</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                id: "1",
                title: "Python for Data Science",
                instructor: "University of Michigan",
                progress: 45,
                image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='170'%3E%3Crect fill='%234F46E5' width='300' height='170'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='white' text-anchor='middle' dominant-baseline='middle'%3EPython Course%3C/text%3E%3C/svg%3E"
              },
              {
                id: "2",
                title: "Web Development with React",
                instructor: "Meta",
                progress: 65,
                image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='170'%3E%3Crect fill='%2310B981' width='300' height='170'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='white' text-anchor='middle' dominant-baseline='middle'%3EReact Course%3C/text%3E%3C/svg%3E"
              },
              {
                id: "3",
                title: "Machine Learning Specialization",
                instructor: "DeepLearning.AI",
                progress: 30,
                image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='170'%3E%3Crect fill='%23F59E0B' width='300' height='170'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='white' text-anchor='middle' dominant-baseline='middle'%3EML Course%3C/text%3E%3C/svg%3E"
              }
            ].map((course) => (
              <Link key={course.id} href={`/course/${course.id}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer group">
                <div className="relative">
                  <Image 
                    src={course.image}
                    alt={course.title}
                    width={400}
                    height={160}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md cursor-pointer">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{course.instructor}</p>
                  
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-600">Progress</span>
                      <span className="text-xs font-bold text-gray-900">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition">
                    Continue
                  </button>
                </div>
              </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Recommended For You</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { id: "4", title: "Cloud Computing", level: "Beginner" },
              { id: "5", title: "Data Analytics", level: "Intermediate" },
              { id: "6", title: "AI & ChatGPT", level: "Intermediate" },
              { id: "7", title: "Cybersecurity", level: "Advanced" }
            ].map((course) => (
              <Link key={course.id} href={`/course/${course.id}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer group">
                <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747 0-6.002-4.5-10.747-10-10.747z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600">{course.title}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {course.level}
                  </span>
                </div>
              </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Explore Learning Paths</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Google Data Analytics Professional Certificate",
                duration: "6 months",
                level: "Beginner"
              },
              {
                title: "AWS Cloud Solutions Architect",
                duration: "4 months",
                level: "Intermediate"
              }
            ].map((path, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{path.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{path.duration} • {path.level}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L10 18l8-8-8-8-1.41 1.41L14.17 9H6v2h8.17z"/>
                  </svg>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 border border-gray-300 text-gray-900 py-2 rounded-md font-medium hover:bg-gray-50 transition">
                    Learn More
                  </button>
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition">
                    Enroll
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
