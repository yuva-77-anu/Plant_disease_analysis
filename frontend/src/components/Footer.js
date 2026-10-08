import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-gray-500 md:flex-row">
        <div className="flex items-center gap-2">
          <Leaf size={16} className="text-primary-600" />
          <span className="font-semibold text-primary-800">PlantGuard</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <p className="text-center">
          AI-powered plant disease detection for healthier crops.
        </p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary-600">Privacy</a>
          <a href="#" className="hover:text-primary-600">Terms</a>
          <a href="#" className="hover:text-primary-600">Contact</a>
        </div>
      </div>
    </footer>
  );
}
