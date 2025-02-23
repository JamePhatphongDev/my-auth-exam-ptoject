import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FlowData {
    id: string
    ui: {
        nodes: Array<{
            attributes: {
                name: string
                value: string
            }
        }>
    }
}

export default function Login() {
    const [flowData, setFlowData] = useState<FlowData | null>(null)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // ฟังก์ชันเริ่มต้นกระบวนการล็อกอิน
    async function initializeFlow() {
        try {
            setIsLoading(true)
            setError('')
            const response = await fetch('/api/kratos/self-service/login/browser', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('ไม่สามารถเริ่มกระบวนการล็อกอินได้')
            }

            const data = await response.json()
            console.log('ข้อมูลกระบวนการล็อกอิน:', data)
            setFlowData(data)
        } catch (err) {
            console.error('ข้อผิดพลาดในการล็อกอิน:', err)
            setError('ไม่สามารถเริ่มกระบวนการล็อกอินได้ กรุณาลองอีกครั้ง')
        } finally {
            setIsLoading(false)
        }
    }

    // ตรวจสอบสถานะการล็อกอินเมื่อคอมโพเนนต์โหลด
    useEffect(() => {
        checkLoginStatus()
    }, [])

    // จัดการการส่งแบบฟอร์มล็อกอิน
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!flowData?.id) return
        try {
            setIsLoading(true)
            setError('')
            const formData = new FormData(e.currentTarget)
            const loginUrl = `/api/kratos/self-service/login?flow=${flowData.id}`
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    method: 'password',
                    password: formData.get('password'),
                    identifier: formData.get('email'),
                    csrf_token: flowData.ui.nodes.find(
                        (node: any) => node.attributes.name === 'csrf_token'
                    )?.attributes.value
                }),
                credentials: 'include'
            })

            // บันทึกการตอบกลับเพื่อดีบัก
            console.log('การตอบกลับการล็อกอิน:', response)

            const responseData = await response.json()
            console.log('ข้อมูลการตอบกลับ:', responseData)

            if (!response.ok) {
                // กรณี flow หมดอายุ
                if (responseData.error?.message.includes('expired')) {
                    await initializeFlow()
                    throw new Error('เซสชันหมดอายุ กรุณาลองอีกครั้ง')
                }
                throw new Error(responseData.error?.message || 'การล็อกอินล้มเหลว')
            }

            // เช็คการล็อกอินสำเร็จ
            if (response.status === 200 || responseData.success) {
                router.push('/dashboard')
            } else {
                throw new Error('การล็อกอินล้มเหลว')
            }
        } catch (err: any) {
            console.error('ข้อผิดพลาดในการล็อกอิน:', err)
            setError(err.message || 'การล็อกอินล้มเหลว')
        } finally {
            setIsLoading(false)
        }
    }

    // ตรวจสอบสถานะการล็อกอิน
    async function checkLoginStatus() {
        try {
            const response = await fetch('http://localhost:4433/sessions/whoami', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                if (data.identity?.id) {
                    router.push("/dashboard")
                } else {
                    initializeFlow()
                }
            } else {
                const errorData = await response.json()
                if (errorData.error?.code === 400 && errorData.error?.id === 'session_already_available') {
                    router.push("/dashboard")
                } else {
                    initializeFlow()
                }
            }
        } catch (error) {
            console.error('ข้อผิดพลาดในการตรวจสอบสถานะการล็อกอิน:', error)
            initializeFlow()
        }
    }

    const handleRetry = () => {
        initializeFlow()
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        เข้าสู่ระบบบัญชีของคุณ
                    </h2>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex justify-between">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                            </div>
                            <button
                                onClick={handleRetry}
                                className="text-sm text-red-800 underline"
                            >
                                ลองอีกครั้ง
                            </button>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-500">กำลังโหลด...</p>
                    </div>
                ) : flowData ? (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                อีเมล
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
                                รหัสผ่าน
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                        </button>
                    </form>
                ) : null}

                <div className="text-center">
                    <Link href="/auth/registration" className="text-sm text-blue-600 hover:text-blue-500">
                        ยังไม่มีบัญชี? สมัครสมาชิก
                    </Link>
                </div>

                <div className="space-y-2">
                    <button
                        onClick={() => {
                            window.location.href = 'http://localhost:4433/self-service/methods/oidc/google'
                        }}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                        เข้าสู่ระบบด้วย Google
                    </button>
                    <button
                        disabled
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
                    >
                        เข้าสู่ระบบด้วย Apple
                    </button>
                </div>
            </div>
        </div>
    )
}