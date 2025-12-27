import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactModal from '../components/ContactModal';

export default function Home() {
  const navigate = useNavigate();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  const features = [
    {
      icon: '📊',
      title: 'Smart Dashboard',
      description: 'Real-time inventory tracking with intuitive visualizations and actionable insights.'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Forecasting',
      description: 'Predict future demand using machine learning algorithms and historical data patterns.'
    },
    {
      icon: '📈',
      title: 'Demand Analytics',
      description: 'Comprehensive analysis of medicine demand trends for optimal stock management.'
    },
    {
      icon: '🌤️',
      title: 'Weather Integration',
      description: 'Correlate weather patterns with medicine demand for seasonal planning.'
    },
    {
      icon: '📥',
      title: 'Bulk Import',
      description: 'Easily upload CSV/Excel files to manage large inventories efficiently.'
    },
    {
      icon: '👥',
      title: 'User Management',
      description: 'Role-based access control for admins, analysts, and operators.'
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Upload Your Data',
      description: 'Import your medicine inventory data via CSV/Excel or enter manually.'
    },
    {
      step: '02',
      title: 'AI Analysis',
      description: 'Our machine learning models analyze historical sales and weather patterns.'
    },
    {
      step: '03',
      title: 'Get Predictions',
      description: 'Receive accurate demand forecasts to optimize your stock levels.'
    }
  ];

  const teamMembers = [
    {
      name: 'Dr. Instructor Name',
      role: 'Project Supervisor',
      image: '👨‍🏫',
      description: 'Guiding the development of intelligent healthcare solutions'
    },
    {
      name: 'Team Member 1',
      role: 'Full Stack Developer',
      image: '👨‍💻',
      description: 'Backend & ML Engineering'
    },
    {
      name: 'Team Member 2',
      role: 'Frontend Developer',
      image: '👩‍💻',
      description: 'UI/UX & React Development'
    },
    {
      name: 'Team Member 3',
      role: 'Data Analyst',
      image: '👨‍🔬',
      description: 'Data Processing & Analysis'
    },
    {
      name: 'Team Member 4',
      role: 'ML Engineer',
      image: '👩‍🔬',
      description: 'Machine Learning & Forecasting'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white bg-opacity-95 backdrop-blur-md shadow-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">💊</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                MedInsights
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('home')}
                className={`font-medium transition-colors ${
                  activeSection === 'home' ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className={`font-medium transition-colors ${
                  activeSection === 'features' ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className={`font-medium transition-colors ${
                  activeSection === 'how-it-works' ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className={`font-medium transition-colors ${
                  activeSection === 'about' ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                About Us
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all"
              >
                Sign In
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-full text-sm"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 pb-20 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Intelligent Medicine
              <br />
              <span className="text-primary-100">Demand Forecasting</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-50 mb-12 max-w-3xl mx-auto">
              Optimize your pharmacy stock with AI-powered demand predictions. Never run out of essential medicines or overstock again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-8 py-4 bg-white text-primary-600 font-bold rounded-full text-lg hover:shadow-2xl hover:scale-105 transition-all"
              >
                Request Access
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full text-lg hover:bg-white hover:text-primary-600 transition-all"
              >
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">100%</div>
                <div className="text-primary-100 font-medium">Standalone</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">AI</div>
                <div className="text-primary-100 font-medium">Powered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
                <div className="text-primary-100 font-medium">Real-time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage medicine inventory and predict demand
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple three-step process to start forecasting demand
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 text-white text-3xl font-bold rounded-full mb-6 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Optimize Your Stock Management?
          </h2>
          <p className="text-xl text-primary-50 mb-10 max-w-2xl mx-auto">
            Join leading pharmacies using AI-powered demand forecasting to reduce waste, prevent stockouts, and improve patient care.
          </p>
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="px-10 py-5 bg-white text-primary-600 font-bold rounded-full text-xl hover:shadow-2xl hover:scale-110 transition-all"
          >
            Request Demo Access
          </button>
        </div>
      </section>

      {/* About Us / Team Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate individuals dedicated to revolutionizing healthcare inventory management
            </p>
          </div>

          {/* Instructor/Supervisor - Centered */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-5xl">{teamMembers[0].image}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{teamMembers[0].name}</h3>
                <div className="text-primary-600 font-semibold text-lg mb-3">{teamMembers[0].role}</div>
                <p className="text-gray-600">{teamMembers[0].description}</p>
              </div>
            </div>
          </div>

          {/* Team Members - 2 Columns with Image on Left */}
          <div className="grid md:grid-cols-2 gap-8">
            {teamMembers.slice(1).map((member, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-4xl">{member.image}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <div className="text-primary-600 font-semibold mb-2">{member.role}</div>
                    <p className="text-gray-600 text-sm">{member.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-3xl">💊</span>
                <span className="text-2xl font-bold">MedInsights</span>
              </div>
              <p className="text-gray-400">
                AI-powered medicine demand forecasting and inventory management platform.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('features')} className="block text-gray-400 hover:text-white transition-colors">
                  Features
                </button>
                <button onClick={() => scrollToSection('how-it-works')} className="block text-gray-400 hover:text-white transition-colors">
                  How It Works
                </button>
                <button onClick={() => scrollToSection('about')} className="block text-gray-400 transition-colors">
                  About Us
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Contact</h4>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition-all"
              >
                Get in Touch
              </button>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MedInsights Pro. All rights reserved. Built for better healthcare.</p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  );
}
