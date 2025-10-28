'use client';

import React, { useState } from 'react';
import { slotApi } from '@/lib/api';
import { Loader2, X } from 'lucide-react';


interface CreateSlotFormProps {
    onSuccess: () => void;
    onClose: () => void;
}

const CreateSlotForm: React.FC<CreateSlotFormProps> = ({ onSuccess, onClose }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);
    const [price, setPrice] = useState(500);

    const [timezoneOffset] = useState(() => {
        const offset = new Date().getTimezoneOffset();
        const sign = offset > 0 ? '-' : '+';
        const hours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0');
        const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
        return `${sign}${hours}:${minutes}`;
    });


    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [validationError, setValidationError] = useState('');


    const validateForm = () => {
        if (!date || !startTime || !endTime || !slotDurationMinutes || !price) {
            setValidationError('All fields are required.');
            return false;
        }
        if (startTime >= endTime) {
            setValidationError('End time must be after start time.');
            return false;
        }
        if (price <= 0) {
            setValidationError('Price must be a positive number.');
            return false;
        }
        setValidationError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const formData = {
                date,
                startTime,
                endTime,
                slotDurationMinutes: Number(slotDurationMinutes),
                price: Number(price)
            };
            await slotApi.createSlots(formData);
            onSuccess();
        } catch (err: any) {
            setApiError(err.response?.data?.message || 'Failed to create slots. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Create Time Slots</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {apiError && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {apiError}
                        </div>
                    )}
                    {validationError && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {validationError}
                        </div>
                    )}

                    {/* Date */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                            Date
                        </label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={today}
                            className="mt-1 block w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Start Time */}
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                            Start Time
                        </label>
                        <input
                            type="time"
                            id="startTime"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                            End Time
                        </label>
                        <input
                            type="time"
                            id="endTime"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="slotDurationMinutes" className="block text-sm font-medium text-gray-700">
                            Slot Duration (minutes)
                        </label>
                        <select
                            id="slotDurationMinutes"
                            value={slotDurationMinutes}
                            onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={90}>1.5 hours</option>
                            <option value={120}>2 hours</option>
                            <option value={180}>3 hours</option>
                            <option value={240}>4 hours</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                            Price per Slot (₹)
                        </label>
                        <input
                            type="number"
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            min="0"
                            step="50"
                            className="mt-1 block w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="500"
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
                        <p className="text-sm text-gray-600">
                            This will create multiple slots from {startTime || 'start time'} to {endTime || 'end time'}
                            with {slotDurationMinutes || 60} minute intervals at ₹{price || 500} each.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin h-4 w-4" />
                                    Creating...
                                </>
                            ) : (
                                'Create Slots'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSlotForm;

