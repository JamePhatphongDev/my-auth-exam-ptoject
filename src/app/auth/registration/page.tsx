'use client'
import Registration from '@/components/Registration'

export default function RegistrationPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-6">Register</h1>
                <Registration />
            </div>
        </div>
    )
}