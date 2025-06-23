'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { Eye, EyeOff, ArrowLeft, Check, Calculator, Shield, Sparkles, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  
  const { register } = useAuth()
  const router = useRouter()

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    }
    return requirements
  }

  const passwordRequirements = validatePassword(password)
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required')
      setLoading(false)
      return
    }

    if (!isPasswordValid) {
      setError('Password does not meet requirements')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (!acceptTerms) {
      setError('You must accept the terms and conditions')
      setLoading(false)
      return
    }

    try {
      await register(firstName, lastName, email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <Card className="shadow-elegant-lg border-0 backdrop-blur-sm bg-white/95 animate-fade-in">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto mb-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gradient">TaxPal Pro</h1>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Create your account</CardTitle>
            <CardDescription className="text-gray-600">
              Start managing your taxes smarter with AI-powered insights
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    error={!!error && !firstName.trim()}
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    error={!!error && !lastName.trim()}
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  error={!!error}
                  className="h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    error={!!error && !isPasswordValid}
                    className="h-12 text-base pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {password && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg animate-slide-up">
                    <p className="text-xs text-gray-600 mb-2 font-medium">Password must contain:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center transition-colors ${passwordRequirements.length ? 'text-green-600' : 'text-gray-400'}`}>
                        <Check className="h-3 w-3 mr-1 flex-shrink-0" />
                        8+ characters
                      </div>
                      <div className={`flex items-center transition-colors ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                        <Check className="h-3 w-3 mr-1 flex-shrink-0" />
                        Uppercase letter
                      </div>
                      <div className={`flex items-center transition-colors ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                        <Check className="h-3 w-3 mr-1 flex-shrink-0" />
                        Lowercase letter
                      </div>
                      <div className={`flex items-center transition-colors ${passwordRequirements.number ? 'text-green-600' : 'text-gray-400'}`}>
                        <Check className="h-3 w-3 mr-1 flex-shrink-0" />
                        Number
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    error={!!error && password !== confirmPassword}
                    className="h-12 text-base pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex items-center h-5">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>
                <label htmlFor="acceptTerms" className="text-sm text-gray-600 leading-5">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-slide-up">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-red-600 text-sm">!</span>
                    </div>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-elegant" 
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="text-center">
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign in to your account
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center mb-3">
            <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-blue-900">What you'll get</h3>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p className="flex items-center">
              <Check className="h-3 w-3 mr-2 text-green-600" />
              14-day free trial with full access
            </p>
            <p className="flex items-center">
              <Check className="h-3 w-3 mr-2 text-green-600" />
              AI-powered tax insights and recommendations
            </p>
            <p className="flex items-center">
              <Check className="h-3 w-3 mr-2 text-green-600" />
              Automated expense categorization
            </p>
            <p className="flex items-center">
              <Shield className="h-3 w-3 mr-2 text-blue-600" />
              Bank-level security and encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 