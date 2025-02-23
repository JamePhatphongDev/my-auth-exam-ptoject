'use client'
import Login from '@/components/Login'
import Link from 'next/link'
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <Login />
        <div className="mt-4 text-center">
      </div>
      </div>
    </div>
  )
}