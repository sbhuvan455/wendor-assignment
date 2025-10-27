'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { slotApi } from '@/lib/api';
import { Loader2, X } from 'lucide-react';

const createSlotSchema = z.object({
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    slotDurationMinutes: z.number().min(30, 'Minimum 30 minutes').max(240, 'Maximum 240 minutes'),
    price: z.number().min(0, 'Price cannot be negative'),
});

type CreateSlotFormData = z.infer<typeof createSlotSchema>;

interface CreateSlotFormProps {
    onSuccess: () => void;
    onClose: () => void;
}

const CreateSlotForm: React.FC<CreateSlotFormProps> = ({ onSuccess, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<CreateSlotFormData>({
        resolver: zodResolver(createSlotSchema),
        defaultValues: {
            slotDurationMinutes: 60,
            price: 500,
        },
    });

    const onSubmit = async (data: CreateSlotFormData) => {
        setIsLoading(true);
        setError('');

        try {
            await slotApi.createSlots(data);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create slots. Please try again.');
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

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {/* Date */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                            Date
                        </label>
                        <input
                            {...register('date')}
                            type="date"
                            id="date"
                            min={today}
                            className="mt-1 block w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.date && (
                            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                        )}
                    </div>

                    {/* Start Time */}
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                            Start Time
                        </label>
                        <input
                            {...register('startTime')}
                            type="time"
                            id="startTime"
                            className="mt-1 block w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.startTime && (
                            <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
                        )}
                    </div>

                    {/* End Time */}
                    <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                            End Time
                        </label>
                        <input
                            {...register('endTime')}
                            type="time"
                            id="endTime"
                            className="mt-1 block w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.endTime && (
                            <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
                        )}
                    </div>

                    {/* Slot Duration */}
                    <div>
                        <label htmlFor="slotDurationMinutes" className="block text-sm font-medium text-gray-700">
                            Slot Duration (minutes)
                        </label>
                        <select
                            {...register('slotDurationMinutes', { valueAsNumber: true })}
                            id="slotDurationMinutes"
                            className="mt-1 block w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={90}>1.5 hours</option>
                            <option value={120}>2 hours</option>
                            <option value={180}>3 hours</option>
                            <option value={240}>4 hours</option>
                        </select>
                        {errors.slotDurationMinutes && (
                            <p className="mt-1 text-sm text-red-600">{errors.slotDurationMinutes.message}</p>
                        )}
                    </div>

                    {/* Price */}
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                            Price per Slot (₹)
                        </label>
                        <input
                            {...register('price', { valueAsNumber: true })}
                            type="number"
                            id="price"
                            min="0"
                            step="50"
                            className="mt-1 block w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="500"
                        />
                        {errors.price && (
                            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                        )}
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
                        <p className="text-sm text-gray-600">
                            This will create multiple slots from {watch('startTime') || 'start time'} to {watch('endTime') || 'end time'}
                            with {watch('slotDurationMinutes') || 60} minute intervals at ₹{watch('price') || 500} each.
                        </p>
                    </div>

                    {/* Submit Button */}
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
