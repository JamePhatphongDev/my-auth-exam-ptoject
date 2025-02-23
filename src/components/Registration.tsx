import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Registration() {
    const [flowData, setFlowData] = useState<any>(null)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        initializeFlow()
    }, [])

    async function initializeFlow() {
        try {
            console.log('Starting registration flow...')
            const response = await fetch('/api/kratos/self-service/registration/browser', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error(`Failed to initialize registration flow: ${response.statusText}`)
            }

            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Expected JSON response but got HTML')
            }

            const data = await response.json()
            console.log('Registration flow data:', data)
            setFlowData(data)
        } catch (err) {
            console.error('Registration error:', err)
            setError('Could not initialize registration. Please try again.')
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!flowData?.id) return

        try {
            const formData = new FormData(e.currentTarget)
            const registrationUrl = flowData.ui.action.replace('http://127.0.0.1:4433', '/api/kratos')

            const response = await fetch(registrationUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    method: 'password',
                    password: formData.get('password'),
                    traits: {
                        email: formData.get('email')
                    },
                    csrf_token: flowData.ui.nodes.find(
                        (node: any) => node.attributes.name === 'csrf_token'
                    )?.attributes.value
                }),
                credentials: 'include'
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || 'Registration failed')
            }

            router.push('/auth/login')
        } catch (err: any) {
            console.error('Registration error:', err)
            setError(err.message || 'Registration failed')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {!flowData ? (
                    <div>Loading...</div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={12}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Must be at least 12 characters with numbers, uppercase, lowercase, and special characters.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Create Account
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}