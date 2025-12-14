'use client';

import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/app/components/Footer';

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
                Coursera&apos;s purpose is to democratize education. We aim to empower individuals with the skills they need to compete in the job market and achieve their career goals.
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
            {[
              { value: '150M+', label: 'Learners Worldwide' },
              { value: '7000+', label: 'Courses Available' },
              { value: '200+', label: 'Top Universities' },
              { value: '90%', label: 'Report Career Benefit' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
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
              <p className="text-gray-600">We partner with the world&apos;s best universities and organizations to deliver quality education.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Impact</h3>
              <p className="text-gray-600">We measure success by the positive impact we have on learners&apos; lives and careers.</p>
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
              We believe that education is one of the most powerful forces for good in the world. By connecting people with knowledge and skills, we&apos;re helping to create a more equitable and prosperous future for all.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Leadership Team</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: "Jeff Maggioncalda", role: "CEO & President", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%234F46E5'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='60' fill='white' text-anchor='middle' dominant-baseline='middle'%3EJM%3C/text%3E%3C/svg%3E" },
              { name: "Daphne Koller", role: "Co-Founder & Chief Product Officer", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%2310B981'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='60' fill='white' text-anchor='middle' dominant-baseline='middle'%3EDK%3C/text%3E%3C/svg%3E" },
              { name: "Andrew Ng", role: "Co-Founder & Chairman", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23F59E0B'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='60' fill='white' text-anchor='middle' dominant-baseline='middle'%3EAN%3C/text%3E%3C/svg%3E" },
              { name: "Leah Belsky", role: "Chief Financial Officer", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23EF4444'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='60' fill='white' text-anchor='middle' dominant-baseline='middle'%3ELB%3C/text%3E%3C/svg%3E" },
            ].map((member, i) => (
              <div key={i} className="text-center">
                <Image 
                  src={member.image} 
                  alt={member.name}
                  width={200}
                  height={192}
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

      <Footer />
    </main>
  );
}
