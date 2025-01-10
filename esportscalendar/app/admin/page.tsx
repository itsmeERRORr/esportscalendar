'use client'

import { withAdminAuth } from '@/utils/authMiddleware'

function AdminPage() {
  return (
    <div>
      <h1>Admin Page</h1>
      {/* Conteúdo da página de administração */}
    </div>
  )
}

export default withAdminAuth(AdminPage)

