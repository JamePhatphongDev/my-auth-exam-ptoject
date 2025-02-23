import React from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            // เรียก Kratos logout flow
            const logoutFlow = await fetch('http://localhost:4433/self-service/logout/browser', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            console.log('Logout Flow Response:', {
                status: logoutFlow.status,
                headers: Object.fromEntries(logoutFlow.headers)
            });

            // อ่าน response body เพื่อดูรายละเอียด
            const flowData = await logoutFlow.json();
            console.log('Logout Flow Data:', flowData);

            // หากมี logout_url ให้ทำการ redirect
            if (flowData.logout_url) {
                window.location.href = flowData.logout_url;
                return;
            }

            // กรณีไม่มี logout_url ให้ redirect ด้วย router
            router.push('/auth/login');
        } catch (error) {
            console.error('Logout error:', error);
            router.push('/auth/login');
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                        ออกจากระบบ
                    </button>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6">
                    <p>ยินดีต้อนรับสู่แดชบอร์ด</p>
                </div>
            </div>
        </div>
    )
}