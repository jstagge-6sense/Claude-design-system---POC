// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Avatar } from './Avatar'

figma.connect(Avatar, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    size: figma.enum('Size', { Small: 'small', Medium: 'medium', Large: 'large', XL: 'xl' }),
    status: figma.enum('Status', { Online: 'online', Offline: 'offline', Busy: 'busy', Away: 'away' }),
    placeholder: figma.enum('Type', { Placeholder: true }),
    name: figma.string('Name'),
  },
  example: ({ size, status, placeholder, name }) => <Avatar name={name} size={size} status={status} placeholder={placeholder} />,
})
