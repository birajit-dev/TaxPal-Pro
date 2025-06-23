'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, Star, ArrowLeft, Zap, Crown, Rocket } from 'lucide-react'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true)

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started with basic tax tracking',
      price: { monthly: 0, annual: 0 },
      icon: <Star className="h-6 w-6" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      features: [
        { name: 'Up to 50 income entries', included: true },
        { name: 'Up to 100 expense entries', included: true },
        { name: 'Basic tax calculations', included: true },
        { name: 'Manual expense categorization', included: true },
        { name: 'Basic reports (PDF)', included: true },
        { name: 'Email support', included: true },
        { name: 'AI expense categorization', included: false },
        { name: 'Receipt scanning (OCR)', included: false },
        { name: 'Quarterly reminders', included: false },
        { name: 'Advanced tax scenarios', included: false },
        { name: 'Priority support', included: false },
        { name: 'CPA marketplace access', included: false }
      ]
    },
    {
      name: 'Pro',
      description: 'Best for freelancers and small business owners',
      price: { monthly: 12, annual: 99 },
      icon: <Zap className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      popular: true,
      features: [
        { name: 'Unlimited income entries', included: true },
        { name: 'Unlimited expense entries', included: true },
        { name: 'Advanced tax calculations', included: true },
        { name: 'AI expense categorization', included: true },
        { name: 'Receipt scanning (OCR)', included: true },
        { name: 'Quarterly reminders', included: true },
        { name: 'Advanced reports & analytics', included: true },
        { name: 'Tax scenario planning', included: true },
        { name: 'Export to TurboTax/TaxAct', included: true },
        { name: 'Priority email support', included: true },
        { name: 'CPA marketplace access', included: false },
        { name: 'White-glove tax filing', included: false }
      ]
    },
    {
      name: 'Premium',
      description: 'For serious entrepreneurs and growing businesses',
      price: { monthly: 29, annual: 249 },
      icon: <Crown className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: [
        { name: 'Everything in Pro', included: true },
        { name: 'CPA marketplace access', included: true },
        { name: 'White-glove tax filing', included: true },
        { name: 'Multi-business support', included: true },
        { name: 'Team collaboration (3 users)', included: true },
        { name: 'Advanced tax optimization', included: true },
        { name: 'Custom reporting', included: true },
        { name: 'API access', included: true },
        { name: 'Phone support', included: true },
        { name: 'Dedicated account manager', included: true },
        { name: 'Tax audit protection', included: true },
        { name: 'Custom integrations', included: true }
      ]
    }
  ]

  const getPrice = (plan: typeof plans[0]) => {
    return isAnnual ? plan.price.annual : plan.price.monthly
  }

  const getSavings = (plan: typeof plans[0]) => {
    if (plan.price.annual === 0) return null
    const monthlyCost = plan.price.monthly * 12
    const savings = monthlyCost - plan.price.annual
    const percentage = Math.round((savings / monthlyCost) * 100)
    return { amount: savings, percentage }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-xl font-bold text-blue-600">TaxPal Pro</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your tax management needs. All plans include our core features with no hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isAnnual ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Save up to 30%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const price = getPrice(plan)
            const savings = getSavings(plan)

            return (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg scale-105' : 'shadow-md'} ${plan.borderColor}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                      <Rocket className="h-4 w-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className={`text-center ${plan.bgColor} rounded-t-lg`}>
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${plan.bgColor} ${plan.color} mx-auto mb-4`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mb-4">
                    {plan.description}
                  </CardDescription>
                  <div className="text-center">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        ${price}
                      </span>
                      {price > 0 && (
                        <span className="text-gray-500 ml-1">
                          /{isAnnual ? 'year' : 'month'}
                        </span>
                      )}
                    </div>
                    {savings && isAnnual && (
                      <p className="text-sm text-green-600 mt-1">
                        Save ${savings.amount}/year ({savings.percentage}% off)
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link href={plan.name === 'Free' ? '/register' : `/checkout?plan=${plan.name.toLowerCase()}`}>
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                    >
                      {plan.name === 'Free' ? 'Get Started Free' : `Start ${plan.name} Plan`}
                    </Button>
                  </Link>

                  {plan.name !== 'Free' && (
                    <p className="text-xs text-gray-500 text-center mt-3">
                      14-day free trial • No credit card required
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Taxes?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of freelancers who trust TaxPal Pro to manage their taxes efficiently and save money.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 