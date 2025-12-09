import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Shield } from 'lucide-react';

export default function ElectronLandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center max-w-2xl px-4">
        {/* Logo and Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Shield className="size-16 text-blue-600" />
        </div>
        
        <h1 className="text-blue-600 mb-6">
          Welcome
        </h1>
        
        <p className="text-gray-600 mb-12">
          Secure Online Exam Proctoring Platform
        </p>

        {/* Login Button */}
        <Link to="/login">
          <Button size="lg" className="px-12">
            Login
          </Button>
        </Link>

        {/* Footer Info */}
        <div className="mt-16 text-gray-500">
          <p>Trusted by 1,200+ institutions worldwide</p>
        </div>
      </div>
    </div>
  );
}