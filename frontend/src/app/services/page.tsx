'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Star, Search, Filter, User } from 'lucide-react';
import { slotApi } from '@/lib/api';

interface AvailableSlot {
    id: number;
    startTime: string;
    endTime: string;
    price: number;
    providerName: string;
    providerId: number;
    serviceType: string;
}

const SERVICE_TYPES = [
    'Electrician',
    'Carpentry',
    'CarWasher',
    'Plumbing',
    'ApplianceRepair'
];

export default function ServicesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedServiceType, setSelectedServiceType] = useState('');
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');


    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().split('T')[0]);
    }, []);

    const searchSlots = async () => {
        if (!selectedDate || !selectedServiceType) {
            setError('Please select both date and service type');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const slots = await slotApi.getAvailableSlots(selectedDate, selectedServiceType);
            setAvailableSlots(slots);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch available slots');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookSlot = (slotId: number) => {
        if (!user) {
            router.push('/login');
            return;
        }
        router.push(`/book/${slotId}`);
    };

    const formatTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Find Services</h1>
                            <p className="text-gray-600">Book skilled professionals for your needs</p>
                        </div>
                        {user && (
                            <div className="text-sm text-gray-600">
                                Welcome, {user.name}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Search className="h-5 w-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900">Search Services</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Date Selection */}
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                                Select Date
                            </label>
                            <input
                                type="date"
                                id="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 text-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Service Type Selection */}
                        <div>
                            <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                                Service Type
                            </label>
                            <select
                                id="serviceType"
                                value={selectedServiceType}
                                onChange={(e) => setSelectedServiceType(e.target.value)}
                                className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select a service</option>
                                {SERVICE_TYPES.map((service) => (
                                    <option key={service} value={service}>
                                        {service}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search Button */}
                        <div className="flex items-end">
                            <button
                                onClick={searchSlots}
                                disabled={isLoading || !selectedDate || !selectedServiceType}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-4 w-4" />
                                        Search
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                </div>

                {/* Results */}
                {availableSlots.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Available Slots for {formatDate(selectedDate)}
                            </h2>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">
                                    {availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''} found
                                </span>
                            </div>
                        </div>

                        {/* Time Slots Summary */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <h3 className="font-medium text-blue-900">Available Time Slots</h3>
                                        <p className="text-sm text-blue-700">
                                            {(() => {
                                                const timeSlots = [...new Set(availableSlots.map(slot => formatTime(slot.startTime)))].sort();
                                                return timeSlots.length > 0 ? timeSlots.join(', ') : 'No slots available';
                                            })()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-900">
                                        {[...new Set(availableSlots.map(slot => formatTime(slot.startTime)))].length}
                                    </div>
                                    <div className="text-sm text-blue-700">Time Slots</div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Layout */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Choose Your Time & Provider</h3>
                                <p className="text-sm text-gray-600">Select a time slot and choose from available providers</p>
                            </div>

                            <div className="p-6">
                                {(() => {
                                    const slotsByTime = availableSlots.reduce((acc, slot) => {
                                        const timeKey = formatTime(slot.startTime);
                                        if (!acc[timeKey]) acc[timeKey] = [];
                                        acc[timeKey].push(slot);
                                        return acc;
                                    }, {} as Record<string, AvailableSlot[]>);

                                    const sortedTimes = Object.keys(slotsByTime).sort((a, b) => {
                                        const timeA = new Date(`2000-01-01 ${a}`).getTime();
                                        const timeB = new Date(`2000-01-01 ${b}`).getTime();
                                        return timeA - timeB;
                                    });

                                    return (
                                        <div className="space-y-8">
                                            {sortedTimes.map((time, index) => (
                                                <div key={time} className="relative">
                                                    <div className="flex items-start gap-6">
                                                        <div className="flex-shrink-0 w-20">
                                                            <div className="bg-blue-600 text-white text-sm font-bold px-3 py-2 rounded-lg text-center">
                                                                {time}
                                                            </div>
                                                            {index < sortedTimes.length - 1 && (
                                                                <div className="w-0.5 h-8 bg-blue-200 mx-auto mt-2"></div>
                                                            )}
                                                        </div>

                                                        {/* Provider cards column */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="mb-2">
                                                                <h4 className="text-sm font-medium text-gray-700">
                                                                    {slotsByTime[time].length} provider{slotsByTime[time].length !== 1 ? 's' : ''} available
                                                                </h4>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                {slotsByTime[time].map((slot) => (
                                                                    <div
                                                                        key={slot.id}
                                                                        className="bg-white rounded-lg p-4 hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300 hover:scale-105"
                                                                    >
                                                                        <div className="space-y-3">
                                                                            {/* Provider Header */}
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-2">
                                                                                    <User className="h-4 w-4 text-blue-600" />
                                                                                    <span className="font-medium text-gray-900 text-sm">{slot.providerName}</span>
                                                                                </div>
                                                                                <div className="text-xs text-gray-500">{slot.serviceType}</div>
                                                                            </div>

                                                                            {/* Service Details */}
                                                                            <div className="space-y-2">
                                                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                                                    <Clock className="h-3 w-3" />
                                                                                    <span>
                                                                                        {Math.round((new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / (1000 * 60))} minutes
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                                                    <Star className="h-3 w-3 text-yellow-500" />
                                                                                    <span>Professional Service</span>
                                                                                </div>
                                                                            </div>

                                                                            {/* Price */}
                                                                            <div className="text-center py-2">
                                                                                <div className="text-2xl font-bold text-green-600">₹{slot.price}</div>
                                                                                <div className="text-xs text-gray-500">per service</div>
                                                                            </div>

                                                                            {/* Book Button */}
                                                                            <button
                                                                                onClick={() => handleBookSlot(slot.id)}
                                                                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                                                                            >
                                                                                Book Now
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {/* No Results */}
                {availableSlots.length === 0 && selectedDate && selectedServiceType && !isLoading && (
                    <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No slots available</h3>
                        <p className="text-gray-600">
                            No {selectedServiceType.toLowerCase()} services are available for {formatDate(selectedDate)}.
                            Try selecting a different date or service type.
                        </p>
                    </div>
                )}

                {/* Initial State */}
                {!selectedDate || !selectedServiceType ? (
                    <div className="text-center py-12">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Search for Services</h3>
                        <p className="text-gray-600">
                            Select a date and service type to find available professionals.
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
