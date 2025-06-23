'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calculator, 
  TrendingUp, 
  Shield, 
  Clock, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  ArrowRight,
  Star,
  Users,
  Zap,
  BarChart3,
  Target,
  Sparkles,
  Menu,
  X
} from 'lucide-react'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const features = [
    {
      icon: <Calculator className="h-8 w-8 text-blue-500" />,
      title: "Smart Tax Calculations",
      description: "Real-time tax estimates with 2024 tax brackets and self-employment calculations using advanced algorithms"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-emerald-500" />,
      title: "Income & Expense Tracking",
      description: "Automatically categorize and track all your freelance income and business expenses with intelligent categorization"
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-500" />,
      title: "AI-Powered Insights",
      description: "Get personalized tax recommendations and identify missed deductions with our advanced AI engine"
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-500" />,
      title: "Quarterly Reminders",
      description: "Never miss a tax deadline with automated quarterly payment reminders and calendar integration"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-indigo-500" />,
      title: "Professional Reports",
      description: "Generate detailed tax reports and summaries for your accountant or filing with export capabilities"
    },
    {
      icon: <Target className="h-8 w-8 text-pink-500" />,
      title: "Maximize Deductions",
      description: "Identify and track all eligible business deductions to minimize your tax burden and increase savings"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Freelance Designer",
      content: "TaxPal Pro saved me thousands in taxes and hours of paperwork. The AI suggestions are incredibly accurate and helpful!",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Mike Chen",
      role: "Independent Consultant",
      content: "Finally, a tax tool that understands freelancers. The quarterly estimates are spot-on and the interface is beautiful.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Content Creator",
      content: "I love how it automatically categorizes my expenses. Tax season is no longer stressful - it's actually enjoyable!",
      rating: 5,
      avatar: "ER"
    }
  ]

  const stats = [
    { value: "12,000+", label: "Active Users", icon: <Users className="h-5 w-5" /> },
    { value: "$3.2M+", label: "Tax Savings", icon: <DollarSign className="h-5 w-5" /> },
    { value: "4.9/5", label: "User Rating", icon: <Star className="h-5 w-5" /> },
    { value: "99.8%", label: "Accuracy Rate", icon: <Target className="h-5 w-5" /> }
  ]

  const pricingPlans = [
    {
      name: "Starter",
      price: "$9",
      period: "/month",
      description: "Perfect for new freelancers",
      features: [
        "Up to 50 transactions/month",
        "Basic tax calculations",
        "Expense tracking",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$19",
      period: "/month",
      description: "Best for growing businesses",
      features: [
        "Unlimited transactions",
        "AI-powered insights",
        "Quarterly reminders",
        "Priority support",
        "Advanced reports",
        "Receipt scanning"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$39",
      period: "/month",
      description: "For established businesses",
      features: [
        "Everything in Professional",
        "Multi-user access",
        "Custom integrations",
        "Dedicated support",
        "Tax consultant access"
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-gradient">TaxPal Pro</h1>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Pricing
                </a>
                <a href="#testimonials" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Reviews
                </a>
                <Link href="/login">
                  <Button variant="ghost" className="hover:bg-blue-50">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden animate-slide-up">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 rounded-b-lg">
                <a href="#features" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                  Features
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                  Pricing
                </a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                  Reviews
                </a>
                <Link href="/login" className="block">
                  <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                </Link>
                <Link href="/register" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">Get Started</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-8 border border-blue-200">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Tax Management Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Smart Tax Management for{' '}
              <span className="text-gradient">Freelancers</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Track income, expenses, and minimize your tax burden with AI-powered insights. 
              Join thousands of freelancers who save time and money on taxes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-elegant">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 hover:bg-blue-50">
                  View Demo
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex items-center justify-center mb-2">
                    <div className="text-blue-600 mr-2">{stat.icon}</div>
                    <div className="text-3xl md:text-4xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need for Tax Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tax management tools designed specifically for freelancers and independent contractors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-elegant-lg transition-all duration-300 border-0 shadow-elegant animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-elegant-lg' : 'border-0 shadow-elegant'} transition-all duration-300 hover:shadow-elegant-lg`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-1">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block mt-8">
                    <Button className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}`}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Freelancers
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about TaxPal Pro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-elegant hover:shadow-elegant-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-20"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Simplify Your Taxes?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of freelancers who trust TaxPal Pro to manage their taxes efficiently, 
            save money, and focus on what they do best.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-50 shadow-elegant">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300">
                View Demo
              </Button>
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            ✨ No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-400">TaxPal Pro</h3>
              </div>
              <p className="text-gray-400">
                Smart tax management for freelancers and independent contractors.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tax Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TaxPal Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 