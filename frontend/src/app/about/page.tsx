'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function About() {
  return (
    <main className="min-h-screen bg-white">
      <header className="w-full border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">Coursera</h1>
          </Link>
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            <a href="/" className="hover:text-blue-600">Explore</a>
            <a href="/about" className="hover:text-blue-600">About</a>
            <a href="#" className="hover:text-blue-600">Certificates</a>
            <a href="#" className="hover:text-blue-600">For Enterprise</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium hover:text-blue-600">Log in</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Join for Free
            </button>
          </div>
        </div>
      </header>

      <section className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About Coursera</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl">
            Empowering the world with skills and knowledge to thrive in the digital economy
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Coursera's purpose is to democratize education. We aim to empower individuals with the skills they need to compete in the job market and achieve their career goals.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Through our platform, learners from around the world can access quality education from top universities and companies, regardless of their background or financial situation.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl h-64 md:h-96 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-24 h-24 mx-auto text-blue-600 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <h3 className="text-2xl font-bold text-blue-600">Empowerment</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">By The Numbers</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">150M+</div>
              <p className="text-gray-600">Learners Worldwide</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">7000+</div>
              <p className="text-gray-600">Courses Available</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">200+</div>
              <p className="text-gray-600">Top Universities</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">90%</div>
              <p className="text-gray-600">Report Career Benefit</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accessibility</h3>
              <p className="text-gray-600">Education should be accessible to everyone, everywhere, regardless of financial means.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality</h3>
              <p className="text-gray-600">We partner with the world's best universities and organizations to deliver quality education.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Impact</h3>
              <p className="text-gray-600">We measure success by the positive impact we have on learners' lives and careers.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Story</h2>
          <div className="bg-white rounded-lg p-8 md:p-12 shadow-md">
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Coursera was founded in 2012 by Daphne Koller and Andrew Ng, computer scientists at Stanford University who wanted to make world-class education accessible to everyone. What started as a vision to democratize higher education has grown into a global learning platform.
            </p>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Today, Coursera works with more than 200 leading universities and companies to offer courses, specializations, and degrees that are accessible and affordable. Our learners come from every corner of the world, united by a desire to learn, grow, and achieve their goals.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We believe that education is one of the most powerful forces for good in the world. By connecting people with knowledge and skills, we're helping to create a more equitable and prosperous future for all.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Leadership Team</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: "Jeff Maggioncalda", role: "CEO & President", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80" },
              { name: "Daphne Koller", role: "Co-Founder & Chief Product Officer", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&q=80" },
              { name: "Andrew Ng", role: "Co-Founder & Chairman", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80" },
              { name: "Leah Belsky", role: "Chief Financial Officer", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80" },
            ].map((member, i) => (
              <div key={i} className="text-center">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-48 object-cover rounded-lg mb-4 bg-gray-200"
                />
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start your learning journey today and become part of millions of learners transforming their lives.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-md font-bold hover:bg-gray-100 transition">
            Get Started Free
          </button>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-blue-600 mb-4">Coursera</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Build skills with courses, certificates, and degrees online from world-class universities and companies.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Coursera</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/about" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Careers</a></li>
                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">Newsroom</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Learning</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Courses</a></li>
                <li><a href="#" className="hover:text-gray-900">Degrees</a></li>
                <li><a href="#" className="hover:text-gray-900">Certificates</a></li>
                <li><a href="#" className="hover:text-gray-900">For Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900">Accessibility</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Terms</a></li>
                <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-900">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <p>&copy; 2025 Coursera Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-gray-900">Facebook</a>
              <a href="#" className="hover:text-gray-900">Twitter</a>
              <a href="#" className="hover:text-gray-900">LinkedIn</a>
              <a href="#" className="hover:text-gray-900">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
