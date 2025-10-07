import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { User, Service, Booking } from '../types';
import { storage } from '../storage';

interface FreelancerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function FreelancerDashboard({ user, onLogout }: FreelancerDashboardProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'bookings' | 'profile'>('services');

  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    price: '',
    deliveryDays: '',
  });

  const [profileForm, setProfileForm] = useState({
    fullName: user.fullName,
    bio: user.bio || '',
    skills: user.skills?.join(', ') || '',
    hourlyRate: user.hourlyRate?.toString() || '',
  });

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = () => {
    setServices(storage.getServicesByFreelancer(user.id));
    setBookings(storage.getBookingsByFreelancer(user.id));
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingService) {
      storage.updateService(editingService.id, {
        title: serviceForm.title,
        description: serviceForm.description,
        category: serviceForm.category,
        price: parseFloat(serviceForm.price),
        deliveryDays: parseInt(serviceForm.deliveryDays),
      });
    } else {
      const newService: Service = {
        id: crypto.randomUUID(),
        freelancerId: user.id,
        freelancerName: user.fullName,
        title: serviceForm.title,
        description: serviceForm.description,
        category: serviceForm.category,
        price: parseFloat(serviceForm.price),
        deliveryDays: parseInt(serviceForm.deliveryDays),
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      storage.addService(newService);
    }

    setServiceForm({ title: '', description: '', category: 'Web Development', price: '', deliveryDays: '' });
    setEditingService(null);
    setShowServiceForm(false);
    loadData();
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price.toString(),
      deliveryDays: service.deliveryDays.toString(),
    });
    setShowServiceForm(true);
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      storage.deleteService(serviceId);
      loadData();
    }
  };

  const handleToggleActive = (service: Service) => {
    storage.updateService(service.id, { isActive: !service.isActive });
    loadData();
  };

  const handleUpdateBookingStatus = (bookingId: string, status: Booking['status']) => {
    storage.updateBooking(bookingId, { status });
    loadData();
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateUser(user.id, {
      fullName: profileForm.fullName,
      bio: profileForm.bio,
      skills: profileForm.skills.split(',').map(s => s.trim()).filter(s => s),
      hourlyRate: parseFloat(profileForm.hourlyRate) || 0,
    });
    const updatedUser = storage.getUserById(user.id);
    if (updatedUser) {
      storage.setCurrentUser(updatedUser);
      window.location.reload();
    }
  };

  const categories = ['Web Development', 'Mobile Development', 'Design', 'Writing', 'Marketing', 'Video Editing', 'Other'];

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
                onClick={() => setActiveTab('services')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'services'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Services
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Services</h2>
              <button
                onClick={() => setShowServiceForm(!showServiceForm)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Add Service
              </button>
            </div>

            {showServiceForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  {editingService ? 'Edit Service' : 'Create New Service'}
                </h3>
                <form onSubmit={handleServiceSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Title
                    </label>
                    <input
                      type="text"
                      required
                      value={serviceForm.title}
                      onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Professional Website Development"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      required
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your service in detail..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={serviceForm.category}
                        onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="0.01"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="99.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery (days)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={serviceForm.deliveryDays}
                        onChange={(e) => setServiceForm({ ...serviceForm, deliveryDays: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="7"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingService ? 'Update Service' : 'Create Service'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowServiceForm(false);
                        setEditingService(null);
                        setServiceForm({ title: '', description: '', category: 'Web Development', price: '', deliveryDays: '' });
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map(service => (
                <div key={service.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                        {service.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditService(service)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <DollarSign size={16} />
                        ${service.price}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {service.deliveryDays} days
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleActive(service)}
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      service.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {service.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              ))}
            </div>

            {services.length === 0 && !showServiceForm && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-500 mb-4">No services yet. Create your first service to get started!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Requests</h2>
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{booking.serviceTitle}</h3>
                      <p className="text-gray-600 mt-1">Client: {booking.clientName}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Requested: {new Date(booking.createdAt).toLocaleDateString()}
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
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                      <p className="text-gray-600">{booking.message}</p>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateBookingStatus(booking.id, 'accepted')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={18} />
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle size={18} />
                        Decline
                      </button>
                    </div>
                  )}

                  {booking.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle size={18} />
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))}

              {bookings.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <p className="text-gray-500">No bookings yet. Your bookings will appear here once clients book your services.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell clients about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={profileForm.skills}
                    onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="React, Node.js, TypeScript"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={profileForm.hourlyRate}
                    onChange={(e) => setProfileForm({ ...profileForm, hourlyRate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="50.00"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Profile
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
