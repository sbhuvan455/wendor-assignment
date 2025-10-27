'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock, User, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { reservationApi } from '@/lib/api';

interface Booking {
    id: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    bookingTime: string;
    slot: {
        id: number;
        startTime: string;
        endTime: string;
        price: number;
        provider: {
            id: number;
            name: string;
            serviceType: string;
        };
    };
}

export default function BookingsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }
        if (!loading && user && user.role !== 'customer') {
            router.push('/');
            return;
        }
        if (user && user.role === 'customer') {
            loadBookings();
        }
    }, [user, loading, router]);

    const loadBookings = async () => {
        try {
            setIsLoading(true);
            const bookingsData = await reservationApi.getCustomerReservations();
            setBookings(bookingsData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load bookings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId: number) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await reservationApi.cancelReservation(bookingId);
            loadBookings();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const formatTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-600" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const isBookingInFuture = (dateTimeString: string) => {
        const bookingTime = new Date(dateTimeString);
        const now = new Date();
        return bookingTime > now;
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user || user.role !== 'customer') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                            <p className="text-gray-600">Manage your service bookings</p>
                        </div>
                        <button
                            onClick={() => router.push('/services')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Calendar className="h-4 w-4" />
                            Book New Service
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                {bookings.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                        <p className="text-gray-600 mb-6">
                            You haven't made any bookings yet. Start by exploring available services.
                        </p>
                        <button
                            onClick={() => router.push('/services')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                        >
                            Browse Services
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                All Bookings ({bookings.length})
                            </h2>
                        </div>

                        <div className="grid gap-6">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(booking.status)}
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Booked: {formatDate(booking.bookingTime)} at {formatTime(booking.bookingTime)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-2">Service Details</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-blue-600" />
                                                            <span className="text-sm text-gray-600">
                                                                {formatDate(booking.slot.startTime)} - {formatTime(booking.slot.startTime)} to {formatTime(booking.slot.endTime)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <User color='green' />
                                                            <span className="text-sm text-gray-600">
                                                                {booking.slot.provider.name} ({booking.slot.provider.serviceType})
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-2">Booking Info</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Duration:</span>
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {Math.round((new Date(booking.slot.endTime).getTime() - new Date(booking.slot.startTime).getTime()) / (1000 * 60))} minutes
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Price:</span>
                                                            <span className="text-sm font-medium text-green-600">₹{booking.slot.price}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Status:</span>
                                                            <span className="text-sm font-medium capitalize text-gray-600">{booking.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Future booking warning */}
                                            {!isBookingInFuture(booking.slot.startTime) && booking.status !== 'cancelled' && (
                                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                        <span className="text-sm text-yellow-800">
                                                            This booking time has passed. Please contact the provider if you need assistance.
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-6 flex flex-col gap-2">
                                            {booking.status === 'pending' && isBookingInFuture(booking.slot.startTime) && (
                                                <button
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                                                >
                                                    Cancel Booking
                                                </button>
                                            )}
                                            {booking.status === 'confirmed' && (
                                                <div className="text-sm text-green-600 font-medium">
                                                    Confirmed ✓
                                                </div>
                                            )}
                                            {booking.status === 'cancelled' && (
                                                <div className="text-sm text-red-600 font-medium">
                                                    Cancelled
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
