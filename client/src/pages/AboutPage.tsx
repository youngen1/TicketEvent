import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-800 font-heading">About ProjectEvents</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Learn more about our platform and mission
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="text-2xl font-bold mb-4 font-heading">Our Mission</h3>
          <p className="text-neutral-700 mb-4">
            ProjectEvents was created to simplify event management and discovery. Our platform helps organizers create and promote events while making it easy for attendees to find and register for events they're interested in.
          </p>
          <p className="text-neutral-700 mb-4">
            We believe that events bring people together, create meaningful connections, and foster communities. Our mission is to make event organization accessible to everyone while providing a seamless experience for attendees.
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4 text-primary font-heading">Key Features</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-neutral-700">Intuitive event creation and management</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-neutral-700">Easy event discovery with powerful search and filtering</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-neutral-700">Seamless registration process for attendees</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-neutral-700">Calendar integration to keep track of events</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-neutral-700">Detailed event analytics for organizers</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-2xl font-bold mb-6 font-heading">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-primary text-xl font-bold">1</span>
              </div>
              <h4 className="text-lg font-bold mb-2">Create Events</h4>
              <p className="text-neutral-600">
                Easily create and customize events with all the details attendees need.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-primary text-xl font-bold">2</span>
              </div>
              <h4 className="text-lg font-bold mb-2">Promote</h4>
              <p className="text-neutral-600">
                Share your events across social media or let attendees discover them on our platform.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-primary text-xl font-bold">3</span>
              </div>
              <h4 className="text-lg font-bold mb-2">Manage</h4>
              <p className="text-neutral-600">
                Track registrations, communicate with attendees, and organize successful events.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-6 font-heading">Our Team</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              name: "Sarah Johnson",
              role: "Founder & CEO",
              image: "https://randomuser.me/api/portraits/women/65.jpg"
            },
            {
              name: "Michael Chen",
              role: "CTO",
              image: "https://randomuser.me/api/portraits/men/32.jpg"
            },
            {
              name: "Alex Rodriguez",
              role: "Design Lead",
              image: "https://randomuser.me/api/portraits/men/68.jpg"
            },
            {
              name: "Emily Williams",
              role: "Marketing Director",
              image: "https://randomuser.me/api/portraits/women/33.jpg"
            }
          ].map((member, index) => (
            <div key={index} className="text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-bold text-lg">{member.name}</h4>
              <p className="text-neutral-600">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
