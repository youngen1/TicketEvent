import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-12">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          <div className="px-5 py-2">
            <a href="#" className="text-base text-neutral-500 hover:text-neutral-900">About</a>
          </div>
          <div className="px-5 py-2">
            <a href="#" className="text-base text-neutral-500 hover:text-neutral-900">Events</a>
          </div>
          <div className="px-5 py-2">
            <a href="#" className="text-base text-neutral-500 hover:text-neutral-900">Calendar</a>
          </div>
          <div className="px-5 py-2">
            <a href="#" className="text-base text-neutral-500 hover:text-neutral-900">FAQs</a>
          </div>
          <div className="px-5 py-2">
            <a href="#" className="text-base text-neutral-500 hover:text-neutral-900">Contact</a>
          </div>
          <div className="px-5 py-2">
            <a href="#" className="text-base text-neutral-500 hover:text-neutral-900">Privacy Policy</a>
          </div>
          <div className="px-5 py-2">
            <a href="#" className="text-base text-neutral-500 hover:text-neutral-900">Terms of Service</a>
          </div>
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          <a href="#" className="text-neutral-400 hover:text-neutral-500">
            <span className="sr-only">Facebook</span>
            <Facebook className="h-6 w-6" />
          </a>
          <a href="#" className="text-neutral-400 hover:text-neutral-500">
            <span className="sr-only">Instagram</span>
            <Instagram className="h-6 w-6" />
          </a>
          <a href="#" className="text-neutral-400 hover:text-neutral-500">
            <span className="sr-only">Twitter</span>
            <Twitter className="h-6 w-6" />
          </a>
          <a href="#" className="text-neutral-400 hover:text-neutral-500">
            <span className="sr-only">LinkedIn</span>
            <Linkedin className="h-6 w-6" />
          </a>
        </div>
        <p className="mt-8 text-center text-base text-neutral-500">&copy; 2023 ProjectEvents. All rights reserved.</p>
      </div>
    </footer>
  );
}
