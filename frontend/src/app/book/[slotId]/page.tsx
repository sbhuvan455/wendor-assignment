'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock, MapPin, User, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { slotApi, reservationApi } from '@/lib/api';

interface SlotDetails {
    id: number;
    startTime: string;
    endTime: string;
    price: number;
    providerName: string;
    providerId: number;
    serviceType: string;
}

export default function BookSlotPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const slotId = parseInt(params.slotId as string);

    const [slotDetails, setSlotDetails] = useState<SlotDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [error, setError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);

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
            loadSlotDetails();
        }
    }, [user, loading, router, slotId]);

    const loadSlotDetails = async () => {
        try {
            setIsLoading(true);
            const slotDetails = await slotApi.getSlotById(slotId);
            console.log(slotDetails)
            setSlotDetails(slotDetails);
        } catch (error) {
            setError('Failed to load slot details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!user || user.role !== 'customer') {
            router.push('/login');
            return;
        }

        setIsBooking(true);
        setError('');

        try {
            await reservationApi.createReservation(slotId);
            setBookingSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to book slot. Please try again.');
        } finally {
            setIsBooking(false);
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

    const isSlotInFuture = (dateTimeString: string) => {
        const slotTime = new Date(dateTimeString);
        const now = new Date();
        return slotTime > now;
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

    if (bookingSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-600 mb-6">
                        Your slot has been successfully booked. You will receive a confirmation email shortly.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/bookings')}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            View My Bookings
                        </button>
                        <button
                            onClick={() => router.push('/services')}
                            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                        >
                            Book Another Service
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Book Service</h1>
                            <p className="text-gray-600">Confirm your booking details</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                {slotDetails ? (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Slot Details */}
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {formatDate(slotDetails.startTime)}
                                            </p>
                                            <p className="text-gray-600">
                                                {formatTime(slotDetails.startTime)} - {formatTime(slotDetails.endTime)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">{slotDetails.providerName}</p>
                                            <p className="text-gray-600">{slotDetails.serviceType}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">Service Location</p>
                                            <p className="text-gray-600">To be confirmed with provider</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Service:</span>
                                            <span className="font-medium">{slotDetails.serviceType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Duration:</span>
                                            <span className="font-medium">
                                                {Math.round((new Date(slotDetails.endTime).getTime() - new Date(slotDetails.startTime).getTime()) / (1000 * 60))} minutes
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Provider:</span>
                                            <span className="font-medium">{slotDetails.providerName}</span>
                                        </div>
                                        <div className="border-t border-gray-300 pt-2 mt-2">
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total:</span>
                                                <span className="text-green-600">₹{slotDetails.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <p className="text-gray-900">{user.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <p className="text-gray-900">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Future Time Validation */}
                        {!isSlotInFuture(slotDetails.startTime) && (
                            <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500">
                                <div className="flex">
                                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                                    <div>
                                        <p className="text-yellow-800 font-medium">This slot is in the past</p>
                                        <p className="text-yellow-700 text-sm">
                                            You cannot book slots that have already passed. Please select a future time slot.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Booking Actions */}
                        <div className="p-6 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    By booking this slot, you agree to our terms and conditions.
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => router.back()}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleBooking}
                                        disabled={isBooking || !isSlotInFuture(slotDetails.startTime)}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isBooking ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Booking...
                                            </>
                                        ) : (
                                            'Confirm Booking'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Slot Not Found</h3>
                        <p className="text-gray-600 mb-6">
                            The requested slot could not be found or may no longer be available.
                        </p>
                        <button
                            onClick={() => router.push('/services')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Browse Services
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
