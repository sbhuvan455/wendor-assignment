'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';


enum UserRole {
    customer = "customer",
    provider = "provider"
}

enum ServiceType {
    Electrician = "Electrician",
    Carpentry = "Carpentry",
    CarWasher = "CarWasher",
    Plumbing = "Plumbing",
    ApplianceRepair = "ApplianceRepair"
}


const serviceTypes = [
    { value: ServiceType.Electrician, label: 'Electrician' },
    { value: ServiceType.Carpentry, label: 'Carpentry' },
    { value: ServiceType.CarWasher, label: 'Car Washer' },
    { value: ServiceType.Plumbing, label: 'Plumbing' },
    { value: ServiceType.ApplianceRepair, label: 'Appliance Repair' },
];

const RegisterForm = () => {
    const { register: registerUser } = useAuth();
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole | ''>('');
    const [serviceType, setServiceType] = useState<ServiceType | ''>('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');


    const [validationErrors, setValidationErrors] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        serviceType: ''
    });


    const validateForm = () => {
        const errors = { name: '', email: '', password: '', confirmPassword: '', role: '', serviceType: '' };
        let isValid = true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex

        if (!name.trim()) {
            errors.name = 'Name is required';
            isValid = false;
        } else if (name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
            isValid = false;
        }
        if (!email.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(email)) {
            errors.email = 'Invalid email format';
            isValid = false;
        }
        if (!password) {
            errors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
            isValid = false;
        }
        if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords don't match";
            isValid = false;
        }
        if (!role) {
            errors.role = 'Please select a role';
            isValid = false;
        }
        if (role === UserRole.provider && !serviceType) {
            errors.serviceType = 'Service type is required for providers';
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const userData: {
                name: string;
                email: string;
                password: string;
                role: UserRole;
                serviceType?: ServiceType;
            } = {
                name,
                email,
                password,
                role: role as UserRole,
            };
            if (role === UserRole.provider) {
                userData.serviceType = serviceType as ServiceType;
            }

            await registerUser(userData);
            router.push('/');
        } catch (err: any) {
            setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Create Account</h2>

            {apiError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {apiError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your full name"
                    />
                    {validationErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email"
                    />
                    {validationErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                </div>

                {/* Role Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        I want to register as:
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="role"
                                value={UserRole.customer}
                                checked={role === UserRole.customer}
                                onChange={() => setRole(UserRole.customer)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Customer (Book services)</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="role"
                                value={UserRole.provider}
                                checked={role === UserRole.provider}
                                onChange={() => setRole(UserRole.provider)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Service Provider (Offer services)</span>
                        </label>
                    </div>
                    {validationErrors.role && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.role}</p>
                    )}
                </div>

                {/* Service Type (only for providers) */}
                {role === UserRole.provider && (
                    <div>
                        <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
                            Service Type
                        </label>
                        <select
                            id="serviceType"
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value as ServiceType)}
                            className="mt-1 block w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a service type</option>
                            {serviceTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        {validationErrors.serviceType && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.serviceType}</p>
                        )}
                    </div>
                )}

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div className="mt-1 relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-3 py-2 pr-10 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                            )}
                        </button>
                    </div>
                    {validationErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password
                    </label>
                    <div className="mt-1 relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full px-3 py-2 pr-10 border text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Confirm your password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                            )}
                        </button>
                    </div>
                    {validationErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                            Creating Account...
                        </>
                    ) : (
                        'Create Account'
                    )}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in here
                </a>
            </p>
        </div>
    );
};

export default RegisterForm;

