'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface InviteToken {
  id: string
  code: string
  createdAt: string
  active: boolean
}

export default function InvitesPage() {
  const { data: session, status } = useSession()
  const [invites, setInvites] = useState<InviteToken[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.role === 'BAKER') {
      fetch('/api/invite')
        .then((r) => (r.ok ? r.json() : []))
        .then(setInvites)
    }
  }, [session])

  const generateLink = async () => {
    setError(null)
    const res = await fetch('/api/invite', { method: 'POST' })
    if (res.ok) {
      const { inviteUrl } = await res.json()
      const updated = await fetch('/api/invite').then((r) => r.json())
      setInvites(updated)
      // Copy to clipboard
      navigator.clipboard.writeText(inviteUrl)
      alert('Link copied to clipboard!')
    } else {
      setError((await res.json()).error)
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    await fetch(`/api/invite?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !currentActive }),
    })
    setInvites(
      invites.map((i) => (i.id === id ? { ...i, active: !currentActive } : i))
    )
  }

  const deleteInvite = async (id: string) => {
    if (!confirm('Delete this invite link?')) return
    await fetch(`/api/invite?id=${id}`, { method: 'DELETE' })
    setInvites(invites.filter((i) => i.id !== id))
  }

  if (status === 'loading' || status === 'unauthenticated')
    return <div>Loading...</div>
  if (session.user?.role !== 'BAKER') {
    return <div>Unauthorized</div>
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Referral Links</h2>
      <button onClick={generateLink} style={{ marginBottom: 20 }}>
        Generate New Link
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #D4A843' }}>
            <th style={{ textAlign: 'left' }}>Code</th>
            <th style={{ textAlign: 'left' }}>Created</th>
            <th style={{ textAlign: 'center' }}>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {invites.map((invite) => (
            <tr key={invite.id} style={{ borderBottom: '1px solid #E0E0E0' }}>
              <td style={{ fontFamily: 'monospace' }}>{invite.code}</td>
              <td>{new Date(invite.createdAt).toLocaleDateString()}</td>
              <td style={{ textAlign: 'center' }}>
                {invite.active ? 'Yes' : 'No'}
              </td>
              <td>
                <button
                  onClick={() => toggleActive(invite.id, invite.active)}
                  style={{ marginRight: 5 }}
                >
                  {invite.active ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => deleteInvite(invite.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {invites.length === 0 && (
        <p>No invite links yet. Generate one to share with customers.</p>
      )}
    </div>
  )
}
