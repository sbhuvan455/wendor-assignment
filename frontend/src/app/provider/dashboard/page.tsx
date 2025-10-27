'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, DollarSign, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { slotApi, reservationApi } from '@/lib/api';
import CreateSlotForm from '@/components/forms/CreateSlotForm';

interface Slot {
    id: number;
    startTime: string;
    endTime: string;
    price: number;
    status: 'available' | 'booked';
    reservation?: {
        id: number;
        status: 'pending' | 'confirmed' | 'cancelled';
        customer: {
            id: number;
            name: string;
            email: string;
        };
    };
}

interface DashboardStats {
    totalSlots: number;
    availableSlots: number;
    bookedSlots: number;
    totalRevenue: number;
    upcomingBookings: number;
}

export default function ProviderDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'slots' | 'bookings'>('overview');
    const [slots, setSlots] = useState<Slot[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalSlots: 0,
        availableSlots: 0,
        bookedSlots: 0,
        totalRevenue: 0,
        upcomingBookings: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateSlotForm, setShowCreateSlotForm] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }
        if (!loading && user && user.role !== 'provider') {
            router.push('/');
            return;
        }
        if (user && user.role === 'provider') {
            loadDashboardData();
        }
    }, [user, loading, router]);

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            const slotsData = await slotApi.getProviderSlots();
            const bookingsData = await reservationApi.getProviderReservations();
            setSlots(slotsData);
            setBookings(bookingsData);
            calculateStats(slotsData, bookingsData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (slotsData: Slot[], bookingsData: any[]) => {
        const totalSlots = slotsData.length;
        const availableSlots = slotsData.filter(slot => slot.status === 'available').length;
        const bookedSlots = totalSlots - availableSlots;
        const totalRevenue = bookingsData
            .filter(booking => booking.status === 'confirmed')
            .reduce((sum, booking) => sum + booking.slot.price, 0);
        const upcomingBookings = bookingsData.filter(booking =>
            booking.status === 'pending' || booking.status === 'confirmed'
        ).length;

        setStats({
            totalSlots,
            availableSlots,
            bookedSlots,
            totalRevenue,
            upcomingBookings
        });
    };

    const handleDeleteSlot = async (slotId: number) => {
        if (!confirm('Are you sure you want to delete this slot?')) return;

        try {
            await slotApi.deleteSlot(slotId);
            loadDashboardData();
        } catch (error) {
            console.error('Failed to delete slot:', error);
        }
    };

    const handleConfirmBooking = async (reservationId: number) => {
        try {
            await reservationApi.confirmReservation(reservationId);
            loadDashboardData();
        } catch (error) {
            console.error('Failed to confirm booking:', error);
        }
    };

    const handleSlotCreated = () => {
        setShowCreateSlotForm(false);
        loadDashboardData();
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user || user.role !== 'provider') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {user.name}!</p>
                            <p className="text-sm text-blue-600">{user.serviceType} Services</p>
                        </div>
                        <button
                            onClick={() => setShowCreateSlotForm(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Create Slots
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Tabs */}
                <div className="mb-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview', icon: Calendar },
                            { id: 'slots', label: 'Slots', icon: Calendar },
                            { id: 'bookings', label: 'Bookings', icon: Users }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Clock className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Slots</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalSlots}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Available</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.availableSlots}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Users className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Booked</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.bookedSlots}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <DollarSign className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-500 text-center py-8">No recent bookings to display</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Slots Tab */}
                {activeTab === 'slots' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Your Time Slots</h2>
                            <button
                                onClick={() => setShowCreateSlotForm(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add New Slots
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">All Slots</h3>
                            </div>
                            <div className="p-6">
                                {slots.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No slots created yet</p>
                                ) : (
                                    <div className="space-y-4">
                                        {slots.map((slot) => (
                                            <div key={slot.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-4">
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {new Date(slot.startTime).toLocaleDateString()} - {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                Duration: {Math.round((new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / (1000 * 60))} minutes
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-gray-900">₹{slot.price}</p>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${slot.status === 'available'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-orange-100 text-orange-800'
                                                                }`}>
                                                                {slot.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {slot.reservation && (
                                                        <div className="mt-2 p-2 bg-blue-50 rounded">
                                                            <p className="text-sm text-blue-600">
                                                                Status: <span className="capitalize">{slot.reservation.status}</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {slot.reservation && slot.reservation.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleConfirmBooking(slot.reservation!.id)}
                                                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            Confirm
                                                        </button>
                                                    )}
                                                    {slot.status === 'available' && (
                                                        <button
                                                            onClick={() => handleDeleteSlot(slot.id)}
                                                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center gap-1"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Bookings Tab */}
                {activeTab === 'bookings' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Customer Bookings</h2>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">All Bookings</h3>
                            </div>
                            <div className="p-6">
                                {bookings.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No bookings yet</p>
                                ) : (
                                    <div className="space-y-4">
                                        {bookings.map((booking) => (
                                            <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-4">
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {booking.slot.startTime} - {booking.slot.endTime}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                Customer: {booking.customer.name} ({booking.customer.email})
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Booked: {booking.bookingTime}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-gray-900">₹{booking.slot.price}</p>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.status === 'confirmed'
                                                                ? 'bg-green-100 text-green-800'
                                                                : booking.status === 'pending'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {booking.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {booking.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleConfirmBooking(booking.id)}
                                                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            Confirm
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Slot Form Modal */}
            {showCreateSlotForm && (
                <CreateSlotForm
                    onSuccess={handleSlotCreated}
                    onClose={() => setShowCreateSlotForm(false)}
                />
            )}
        </div>
    );
}
