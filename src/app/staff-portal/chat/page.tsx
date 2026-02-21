import React, { Suspense } from 'react'
import StaffChat from '@/components/staffComponents/chat/StaffChat'

export const dynamic = "force-dynamic";

const ChatPage = () => {
    return (
        <Suspense fallback={<div>Loading chat...</div>}>
            <StaffChat />
        </Suspense>
    )
}

export default ChatPage