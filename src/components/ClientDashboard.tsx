import { useState, useEffect } from 'react';
import { Search, Filter, Clock, DollarSign, User, Star } from 'lucide-react';
import { User as UserType, Service, Booking } from '../types';
import { storage } from '../storage';

interface ClientDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export function ClientDashboard({ user, onLogout }: ClientDashboardProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'bookings'>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingMessage, setBookingMessage] = useState('');

  const categories = ['All', 'Web Development', 'Mobile Development', 'Design', 'Writing', 'Marketing', 'Video Editing', 'Other'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchQuery, selectedCategory]);

  const loadData = () => {
    setServices(storage.getActiveServices());
    setBookings(storage.getBookingsByClient(user.id));
  };

  const filterServices = () => {
    let filtered = services;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.freelancerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setShowBookingModal(true);
    setBookingMessage('');
  };

  const handleConfirmBooking = () => {
    if (!selectedService) return;

    const newBooking: Booking = {
      id: crypto.randomUUID(),
      serviceId: selectedService.id,
      serviceTitle: selectedService.title,
      clientId: user.id,
      clientName: user.fullName,
      freelancerId: selectedService.freelancerId,
      freelancerName: selectedService.freelancerName,
      status: 'pending',
      message: bookingMessage,
      price: selectedService.price,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.addBooking(newBooking);
    setShowBookingModal(false);
    setSelectedService(null);
    setBookingMessage('');
    loadData();
    setActiveTab('bookings');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">FreelanceHub</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user.fullName}</span>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex gap-8">
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'marketplace'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Browse Services
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Bookings ({bookings.length})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'marketplace' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Find the Perfect Freelancer</h2>
              <p className="text-gray-600">Browse through our talented freelancers and their services</p>
            </div>

            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services, freelancers..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Filter size={20} className="text-gray-500 flex-shrink-0" />
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {service.category}
                      </span>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={16} fill="currentColor" />
                        <span className="text-sm text-gray-600">5.0</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>

                    <div className="flex items-center gap-2 mb-4 text-gray-700">
                      <User size={16} />
                      <span className="text-sm font-medium">{service.freelancerName}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {service.deliveryDays} days
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Starting at</p>
                        <p className="text-2xl font-bold text-gray-900">${service.price}</p>
                      </div>
                      <button
                        onClick={() => handleBookService(service)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">No services found. Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{booking.serviceTitle}</h3>
                      <p className="text-gray-600 mt-1">Freelancer: {booking.freelancerName}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Booked: {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">${booking.price}</p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                        booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {booking.message && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Your Message:</p>
                      <p className="text-gray-600">{booking.message}</p>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <div className="mt-4 bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        Your booking request is pending. The freelancer will review and respond soon.
                      </p>
                    </div>
                  )}

                  {booking.status === 'accepted' && (
                    <div className="mt-4 bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-700">
                        Your booking has been accepted! The freelancer will start working on your project.
                      </p>
                    </div>
                  )}

                  {booking.status === 'completed' && (
                    <div className="mt-4 bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-700">
                        This project has been completed. Thank you for using FreelanceHub!
                      </p>
                    </div>
                  )}

                  {booking.status === 'cancelled' && (
                    <div className="mt-4 bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-red-700">
                        This booking was declined by the freelancer.
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {bookings.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <p className="text-gray-500 mb-4">You haven't booked any services yet.</p>
                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Services
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showBookingModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Booking</h3>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                <strong>Service:</strong> {selectedService.title}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Freelancer:</strong> {selectedService.freelancerName}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Price:</strong> ${selectedService.price}
              </p>
              <p className="text-gray-700">
                <strong>Delivery:</strong> {selectedService.deliveryDays} days
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to Freelancer (Optional)
              </label>
              <textarea
                value={bookingMessage}
                onChange={(e) => setBookingMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your project requirements..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmBooking}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Confirm Booking
              </button>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedService(null);
                  setBookingMessage('');
                }}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
