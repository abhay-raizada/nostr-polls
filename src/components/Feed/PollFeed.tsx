import { Event } from 'nostr-tools/lib/types/core'
import React from 'react'
import PollResponseForm from '../PollResponse/PollResponseForm'
import { Card } from '@mui/material'

interface PollFeedProps {
    events: Event[]
}

export const PollFeed: React.FC<PollFeedProps> = ({
    events
}) => {
    return (
        <>
            {
                events.map((event: Event) => {
                    return (
                        <Card>
                            <PollResponseForm showDetailsMenu={true} pollEvent={event} />
                        </Card>)
                })
            }
        </>
    )
}