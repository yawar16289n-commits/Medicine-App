import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Infographic() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSection, setActiveSection] = useState('');

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    
    // Switch to appropriate tab based on section
    if (sectionId === 'features') {
      setActiveTab('overview');
    } else if (sectionId === 'how-it-works') {
      setActiveTab('workflow');
    } else if (sectionId === 'about') {
      setActiveTab('tech');
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const systemOverview = {
    title: 'MedInsights Pro',
    subtitle: 'AI-Powered Medicine Demand Forecasting & Inventory Management',
    description: 'A comprehensive platform designed to optimize pharmaceutical stock management through intelligent forecasting and real-time analytics.'
  };

  const workflowSteps = [
    {
      number: '1',
      title: 'Data Collection',
      icon: '📊',
      description: 'Import medicine inventory data via CSV/Excel or manual entry',
      details: ['Bulk upload support', 'Real-time validation', 'Historical data integration']
    },
    {
      number: '2',
      title: 'District Management',
      icon: '🏥',
      description: 'Organize data by districts and therapeutic classes',
      details: ['Multi-district support', 'Formula categorization', 'Hierarchical structure']
    },
    {
      number: '3',
      title: 'Weather Analysis',
      icon: '🌤️',
      description: 'Integrate weather data for seasonal pattern analysis',
      details: ['Temperature tracking', 'Precipitation data', 'Seasonal correlations']
    },
    {
      number: '4',
      title: 'AI Forecasting',
      icon: '🤖',
      description: 'Prophet ML model predicts future demand patterns',
      details: ['Time-series analysis', 'Trend detection', 'Confidence intervals']
    },
    {
      number: '5',
      title: 'Dashboard & Insights',
      icon: '📈',
      description: 'Visualize predictions and track inventory status',
      details: ['Real-time charts', 'Stock level alerts', 'Demand trends']
    },
    {
      number: '6',
      title: 'Decision Making',
      icon: '✅',
      description: 'Make informed procurement decisions',
      details: ['Optimize ordering', 'Reduce waste', 'Prevent stockouts']
    }
  ];

  const modules = [
    {
      name: 'Authentication & Authorization',
      icon: '🔐',
      features: ['JWT-based authentication', 'Role-based access (Admin, Analyst, Operator)', 'Secure password hashing', 'Session management'],
      color: 'from-purple-400 to-purple-600'
    },
    {
      name: 'District Management',
      icon: '🗺️',
      features: ['Create & manage districts', 'Link medicines to districts', 'Geographic organization', 'District-wise analytics'],
      color: 'from-blue-400 to-blue-600'
    },
    {
      name: 'Formula & Medicine Management',
      icon: '💊',
      features: ['Formula categorization', 'Therapeutic class assignment', 'Stock level tracking', 'Bulk import/export'],
      color: 'from-green-400 to-green-600'
    },
    {
      name: 'Weather Integration',
      icon: '☁️',
      features: ['Real-time weather data', 'Historical weather records', 'Temperature & precipitation', 'Seasonal pattern analysis'],
      color: 'from-cyan-400 to-cyan-600'
    },
    {
      name: 'AI Forecasting Engine',
      icon: '🧠',
      features: ['Prophet ML algorithm', 'Time-series forecasting', 'Demand prediction', 'Trend & seasonality analysis'],
      color: 'from-indigo-400 to-indigo-600'
    },
    {
      name: 'Dashboard & Analytics',
      icon: '📊',
      features: ['Real-time visualizations', 'Interactive charts', 'Stock level indicators', 'Demand trend graphs'],
      color: 'from-pink-400 to-pink-600'
    },
    {
      name: 'User Management',
      icon: '👥',
      features: ['User creation & editing', 'Role assignment', 'Activity logging', 'Access control'],
      color: 'from-orange-400 to-orange-600'
    },
    {
      name: 'Activity Tracking',
      icon: '📝',
      features: ['Audit logs', 'User action tracking', 'System events', 'Compliance reporting'],
      color: 'from-red-400 to-red-600'
    }
  ];

  const techStack = {
    frontend: [
      { name: 'React', icon: '⚛️', description: 'UI Library' },
      { name: 'Vite', icon: '⚡', description: 'Build Tool' },
      { name: 'TailwindCSS', icon: '🎨', description: 'Styling' },
      { name: 'Recharts', icon: '📊', description: 'Visualizations' }
    ],
    backend: [
      { name: 'Flask', icon: '🐍', description: 'Web Framework' },
      { name: 'SQLAlchemy', icon: '🗄️', description: 'ORM' },
      { name: 'MySQL', icon: '🐬', description: 'Database' },
      { name: 'Flask-Migrate', icon: '🔄', description: 'Migrations' }
    ],
    ml: [
      { name: 'Prophet', icon: '🔮', description: 'Forecasting' },
      { name: 'Pandas', icon: '🐼', description: 'Data Processing' },
      { name: 'NumPy', icon: '🔢', description: 'Numerical Computing' },
      { name: 'Matplotlib', icon: '📈', description: 'Plotting' }
    ]
  };

  const userRoles = [
    {
      role: 'Admin',
      icon: '👑',
      permissions: ['Full system access', 'User management', 'District configuration', 'All CRUD operations', 'System settings'],
      color: 'bg-gradient-to-br from-yellow-400 to-orange-500'
    },
    {
      role: 'Analyst',
      icon: '🔬',
      permissions: ['View forecasts', 'Generate predictions', 'Access analytics', 'View weather data', 'Export reports'],
      color: 'bg-gradient-to-br from-blue-400 to-indigo-500'
    },
    {
      role: 'Data Operator',
      icon: '⚙️',
      permissions: ['Manage medicines', 'Upload data', 'Update stock levels', 'View inventory', 'Basic analytics'],
      color: 'bg-gradient-to-br from-green-400 to-teal-500'
    }
  ];

  const keyFeatures = [
    {
      category: 'Smart Forecasting',
      items: [
        { title: 'Prophet ML Model', description: 'Advanced time-series forecasting' },
        { title: 'Seasonal Patterns', description: 'Detect and predict seasonal demand' },
        { title: 'Weather Correlation', description: 'Link weather patterns to demand' },
        { title: 'Confidence Intervals', description: 'Prediction accuracy metrics' }
      ]
    },
    {
      category: 'Inventory Management',
      items: [
        { title: 'Real-time Tracking', description: 'Live stock level monitoring' },
        { title: 'Stock Alerts', description: 'Low stock notifications' },
        { title: 'Bulk Operations', description: 'CSV/Excel import & export' },
        { title: 'Multi-district', description: 'Manage multiple locations' }
      ]
    },
    {
      category: 'Analytics & Insights',
      items: [
        { title: 'Interactive Charts', description: 'Visual demand trends' },
        { title: 'Demand Analysis', description: 'Historical pattern analysis' },
        { title: 'Weather Analytics', description: 'Weather impact visualization' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white bg-opacity-95 backdrop-blur-md shadow-md z-40 mb-8">
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
                onClick={() => navigate('/')}
                className="font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/')}
                className="font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => navigate('/')}
                className="font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => navigate('/')}
                className="font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                About Us
              </button>
              <button
                onClick={() => navigate('/infographic')}
                className="font-medium text-primary-600 transition-colors"
              >
                Infographic
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
      <section id="home" className="pt-24 pb-16 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            {systemOverview.title}
          </h1>
          <p className="text-2xl md:text-3xl font-semibold mb-4 text-primary-100">
            {systemOverview.subtitle}
          </p>
          <p className="text-lg md:text-xl text-primary-50 max-w-4xl mx-auto">
            {systemOverview.description}
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="bg-white shadow-md sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 py-4">
            {['overview', 'workflow', 'modules', 'roles', 'tech'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">System Overview</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A complete end-to-end solution for intelligent medicine inventory management
              </p>
            </div>

            {/* Key Features Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {keyFeatures.map((category, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-primary-500">
                    {category.category}
                  </h3>
                  <div className="space-y-4">
                    {category.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mt-1">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl shadow-2xl p-12 text-white">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-5xl font-bold mb-2">8+</div>
                  <div className="text-primary-100 font-medium">Core Modules</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">3</div>
                  <div className="text-primary-100 font-medium">User Roles</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">AI</div>
                  <div className="text-primary-100 font-medium">Powered Forecasting</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">24/7</div>
                  <div className="text-primary-100 font-medium">Real-time Analytics</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <div id="how-it-works" className="space-y-12 animate-fade-in">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">System Workflow</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From data input to intelligent decision-making
              </p>
            </div>

            {/* Workflow Steps */}
            <div className="relative">
              {/* Connection Line (Desktop) */}
              <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary-200 via-secondary-200 to-primary-200" 
                   style={{ top: '120px', left: '10%', right: '10%' }}>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {workflowSteps.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all">
                      {/* Step Number */}
                      <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-4xl text-white font-bold">{step.number}</span>
                        </div>
                      </div>

                      {/* Step Icon */}
                      <div className="text-center">
                        <div className="text-5xl mb-4">{step.icon}</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                        <p className="text-gray-600 mb-4">{step.description}</p>
                        
                        {/* Details */}
                        <div className="space-y-2 pt-4 border-t border-gray-200">
                          {step.details.map((detail, detailIdx) => (
                            <div key={detailIdx} className="flex items-center gap-2 text-sm text-gray-700">
                              <span className="text-primary-500">•</span>
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Arrow for Mobile */}
                    {idx < workflowSteps.length - 1 && (
                      <div className="lg:hidden flex justify-center my-4">
                        <div className="text-4xl text-primary-500">↓</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Process Flow Diagram */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Data Flow Architecture</h3>
              <div className="flex flex-col md:flex-row items-center justify-around gap-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <span className="text-5xl">🗄️</span>
                  </div>
                  <h4 className="font-bold text-gray-900">Database</h4>
                  <p className="text-sm text-gray-600">MySQL + SQLAlchemy</p>
                </div>

                <div className="text-4xl text-gray-400 rotate-90 md:rotate-0">→</div>

                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <span className="text-5xl">🐍</span>
                  </div>
                  <h4 className="font-bold text-gray-900">Backend API</h4>
                  <p className="text-sm text-gray-600">Flask + REST</p>
                </div>

                <div className="text-4xl text-gray-400 rotate-90 md:rotate-0">→</div>

                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <span className="text-5xl">🤖</span>
                  </div>
                  <h4 className="font-bold text-gray-900">ML Engine</h4>
                  <p className="text-sm text-gray-600">Prophet Forecasting</p>
                </div>

                <div className="text-4xl text-gray-400 rotate-90 md:rotate-0">→</div>

                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <span className="text-5xl">⚛️</span>
                  </div>
                  <h4 className="font-bold text-gray-900">Frontend</h4>
                  <p className="text-sm text-gray-600">React + Vite</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">System Modules</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive modules working together seamlessly
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {modules.map((module, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all overflow-hidden">
                  {/* Module Header */}
                  <div className={`bg-gradient-to-br ${module.color} p-6 text-white`}>
                    <div className="text-5xl mb-3 text-center">{module.icon}</div>
                    <h3 className="text-lg font-bold text-center">{module.name}</h3>
                  </div>

                  {/* Module Features */}
                  <div className="p-6">
                    <ul className="space-y-3">
                      {module.features.map((feature, featureIdx) => (
                        <li key={featureIdx} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">User Roles & Permissions</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Role-based access control for secure and efficient operations
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {userRoles.map((role, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
                  {/* Role Header */}
                  <div className={`${role.color} p-8 text-white text-center`}>
                    <div className="text-6xl mb-4">{role.icon}</div>
                    <h3 className="text-2xl font-bold">{role.role}</h3>
                  </div>

                  {/* Permissions */}
                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Permissions:</h4>
                    <ul className="space-y-3">
                      {role.permissions.map((permission, permIdx) => (
                        <li key={permIdx} className="flex items-start gap-3">
                          <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                          <span className="text-gray-700">{permission}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Role Comparison Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold">Feature</th>
                      <th className="px-6 py-4 text-center font-bold">Admin</th>
                      <th className="px-6 py-4 text-center font-bold">Analyst</th>
                      <th className="px-6 py-4 text-center font-bold">Data Operator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      ['View Dashboard', true, true, true],
                      ['Manage Users', true, false, false],
                      ['Manage Districts', true, false, false],
                      ['View Forecasts', true, true, false],
                      ['Generate Predictions', true, true, false],
                      ['Manage Medicines', true, false, true],
                      ['Upload Data', true, false, true],
                      ['View Weather Data', true, true, false],
                      ['System Settings', true, false, false],
                      ['Activity Logs', true, false, false]
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{row[0]}</td>
                        <td className="px-6 py-4 text-center">
                          {row[1] ? <span className="text-2xl text-green-500">✓</span> : <span className="text-2xl text-gray-300">×</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {row[2] ? <span className="text-2xl text-green-500">✓</span> : <span className="text-2xl text-gray-300">×</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {row[3] ? <span className="text-2xl text-green-500">✓</span> : <span className="text-2xl text-gray-300">×</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tech Stack Tab */}
        {activeTab === 'tech' && (
          <div id="about" className="space-y-12 animate-fade-in">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Technology Stack</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built with modern, reliable, and scalable technologies
              </p>
            </div>

            {/* Frontend Stack */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">⚛️</span>
                Frontend Technologies
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                {techStack.frontend.map((tech, idx) => (
                  <div key={idx} className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-lg transition-all">
                    <div className="text-5xl mb-3">{tech.icon}</div>
                    <h4 className="font-bold text-gray-900 mb-1">{tech.name}</h4>
                    <p className="text-sm text-gray-600">{tech.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Backend Stack */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🐍</span>
                Backend Technologies
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                {techStack.backend.map((tech, idx) => (
                  <div key={idx} className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-lg transition-all">
                    <div className="text-5xl mb-3">{tech.icon}</div>
                    <h4 className="font-bold text-gray-900 mb-1">{tech.name}</h4>
                    <p className="text-sm text-gray-600">{tech.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ML Stack */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🤖</span>
                Machine Learning Technologies
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                {techStack.ml.map((tech, idx) => (
                  <div key={idx} className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-lg transition-all">
                    <div className="text-5xl mb-3">{tech.icon}</div>
                    <h4 className="font-bold text-gray-900 mb-1">{tech.name}</h4>
                    <p className="text-sm text-gray-600">{tech.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Diagram */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-8 text-center">System Architecture</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-bold text-xl mb-4 text-cyan-300">Frontend Layer</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• React Components</li>
                    <li>• State Management</li>
                    <li>• Routing (React Router)</li>
                    <li>• API Integration (Axios)</li>
                    <li>• Responsive UI</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-4 text-green-300">Backend Layer</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• REST API Endpoints</li>
                    <li>• JWT Authentication</li>
                    <li>• Business Logic</li>
                    <li>• Database ORM</li>
                    <li>• Middleware</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-4 text-purple-300">Data Layer</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• MySQL Database</li>
                    <li>• Migrations</li>
                    <li>• ML Models</li>
                    <li>• Weather API</li>
                    <li>• Activity Logs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Inventory Management?
          </h2>
          <p className="text-xl text-primary-50 mb-8 max-w-2xl mx-auto">
            Experience the power of AI-driven forecasting and intelligent analytics
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 bg-white text-primary-600 font-bold rounded-full text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-10 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full text-lg hover:bg-white hover:text-primary-600 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-3xl">💊</span>
            <span className="text-2xl font-bold">MedInsights Pro</span>
          </div>
          <p className="text-gray-400">
            &copy; 2025 MedInsights Pro. AI-powered medicine demand forecasting platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
