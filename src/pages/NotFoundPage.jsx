import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-none bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-slate-800 mt-1">Page Not Found</h2>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
        The clinical route or page you are trying to access does not exist or may have
        been relocated.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="primary" icon={ArrowLeft}>
            Return to Clinic Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
