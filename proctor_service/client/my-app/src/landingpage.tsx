import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Shield, Video, Clock, CheckCircle, Eye, Lock } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Shield className="size-8 text-blue-600" />
            <span className="text-blue-600">ProctorSecure</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-blue-600">Secure Online Exam Proctoring</h1>
          <p className="mx-auto mb-8 max-w-2xl text-gray-600">
            Ensure academic integrity with AI-powered proctoring. Real-time monitoring, automated alerts,
            and comprehensive exam security for institutions worldwide.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/signup">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-white">Complete Proctoring Solution</h2>
            <p className="mb-4 text-white">Everything you need to conduct secure online examinations</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-white p-8">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-blue-100">
                <Video className="size-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-gray-900">Live Video Monitoring</h3>
              <p className="text-gray-600">Real-time video surveillance with AI-powered suspicious behavior detection</p>
            </div>

            <div className="rounded-lg border bg-white p-8">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-green-100">
                <Eye className="size-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-gray-900">Screen Recording</h3>
              <p className="text-gray-600">Capture and review screen activity during exams for complete oversight</p>
            </div>

            <div className="rounded-lg border bg-white p-8">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-purple-100">
                <Lock className="size-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-gray-900">Browser Lockdown</h3>
              <p className="text-gray-600">Restrict access to external resources and prevent tab switching</p>
            </div>

            <div className="rounded-lg border bg-white p-8">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-orange-100">
                <Clock className="size-6 text-orange-600" />
              </div>
              <h3 className="mb-2 text-gray-900">Time Management</h3>
              <p className="text-gray-600">Automated timing controls with warnings and automatic submission</p>
            </div>

            <div className="rounded-lg border bg-white p-8">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-red-100">
                <Shield className="size-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-gray-900">Identity Verification</h3>
              <p className="text-gray-600">Multi-factor authentication and ID verification before exam access</p>
            </div>

            <div className="rounded-lg border bg-white p-8">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-indigo-100">
                <CheckCircle className="size-6 text-indigo-600" />
              </div>
              <h3 className="mb-2 text-gray-900">Automated Reports</h3>
              <p className="text-gray-600">Detailed proctoring reports with flagged incidents and video evidence</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 text-center sm:px-6 lg:px-8 md:grid-cols-4">
          <div>
            <div className="mb-2 text-3xl font-semibold">500K+</div>
            <p className="text-blue-100">Exams Proctored</p>
          </div>
          <div>
            <div className="mb-2 text-3xl font-semibold">1,200+</div>
            <p className="text-blue-100">Institutions</p>
          </div>
          <div>
            <div className="mb-2 text-3xl font-semibold">99.9%</div>
            <p className="text-blue-100">Uptime</p>
          </div>
          <div>
            <div className="mb-2 text-3xl font-semibold">24/7</div>
            <p className="text-blue-100">Support</p>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 py-12 text-gray-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2 text-white">
                <Shield className="size-6" />
                <span>ProctorSecure</span>
              </div>
              <p className="text-gray-500">Trusted online proctoring solution for secure examinations.</p>
            </div>
            <div>
              <h4 className="mb-4 text-white">Product</h4>
              <ul className="space-y-2">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>Demo</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-white">Company</h4>
              <ul className="space-y-2">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-white">Legal</h4>
              <ul className="space-y-2">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Compliance</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-500">
            © {new Date().getFullYear()} ProctorSecure. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
