// ======================================================
// File Name : Users.jsx
// Purpose   : Page-level component for Users
// ======================================================

import { useEffect, useState } from 'react';
import { usersApi } from '../../api/users.api';
import { AppLayout } from '../../layout/AppLayout';
import { Pill } from '../../components/ui/ui';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';

// ======================================================
// START: Page Component
// ======================================================

const ROLE_TONE = {
    Administrator: 'purple',
    'Tax Analyst': 'blue',
    Reviewer: 'teal',
    'Read-Only': 'gray'
};
const AVATAR_GRADIENTS = [
    'linear-gradient(135deg,#7c3aed,#2563eb)',
    'linear-gradient(135deg,#0d9488,#2563eb)',
    'linear-gradient(135deg,#d97706,#dc2626)',
    'linear-gradient(135deg,#64748b,#94a3b8)'
];
// ======================================================
// Function : initials
// Purpose  : Implements logic for 'initials'
// ======================================================

function initials(name) {
    return name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

// ======================================================
// END: initials
// ======================================================
const CAPABILITIES = [
    { key: 'viewAssets', label: 'View Assets' },
    { key: 'postEvents', label: 'Post Events' },
    { key: 'approvePost', label: 'Approve/Post' },
    { key: 'runReports', label: 'Run Reports' },
    { key: 'manageUsers', label: 'Manage Users' },
    { key: 'editConfig', label: 'Edit Config' }
];
// ======================================================
// Function : Users
// Purpose  : Custom hook that provides 'Users' state/behaviour
// ======================================================

export function Users() {
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    useEffect(() => {
        usersApi.getRoles().then(setRoles);
        usersApi.getUsers().then(setUsers);
    }, []);
    const totalUsers = roles.reduce((sum, r) => sum + r.userCount, 0);
    const admins = roles.find((r) => r.name === 'Administrator')?.userCount ?? 0;
    const pendingInvites = users.filter((u) => u.status === 'Invited').length;
    const userColumns = [
        {
            header: 'User',
            render: (u) => (<div className="flex items-center gap-2">
          <span className="uavatar" style={{ background: AVATAR_GRADIENTS[users.indexOf(u) % AVATAR_GRADIENTS.length] }}>
            {initials(u.name)}
          </span>
          {u.name}
        </div>)
        },
        { header: 'Email', render: (u) => <span className="text-muted">{u.email}</span> },
        { header: 'Role', render: (u) => <Pill tone={ROLE_TONE[u.role] ?? 'gray'}>{u.role}</Pill> },
        { header: 'Last Active', render: (u) => u.lastActive },
        { header: 'Status', render: (u) => <Pill tone={u.status === 'Active' ? 'green' : 'amber'}>{u.status}</Pill> },
        { header: '', render: (u) => <a className="link">{u.status === 'Invited' ? 'Resend' : 'Edit'}</a> }
    ];
    return (<AppLayout active="users" title="User Management" crumb="Home / Administration / User Management">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage users, roles, and permissions across the fixed-asset platform</p>
          <div className='bg-dark text-light'>hai</div>
        </div>
        <Button variant="primary">+ Invite User</Button>
      </div>

      <div className="grid grid-4 mb-4">
        <div className="card card-pad stat">
          <span className="label">Total Users</span>
          <div className="value" style={{ fontSize: 22 }}>
            {totalUsers || 47}
          </div>
        </div>
        <div className="card card-pad stat">
          <span className="label">Administrators</span>
          <div className="value" style={{ fontSize: 22 }}>
            {admins || 5}
          </div>
        </div>
        <div className="card card-pad stat">
          <span className="label">Pending Invites</span>
          <div className="value" style={{ fontSize: 22 }}>
            {pendingInvites}
          </div>
        </div>
        <div className="card card-pad stat">
          <span className="label">Active Sessions</span>
          <div className="value" style={{ fontSize: 22 }}>
            12
          </div>
        </div>
      </div>

      <div className="grid grid-2 mb-4">
        <div className="card">
          <div className="card-head">
            <h3>Roles &amp; Permissions</h3>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Users</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (<tr key={r.name}>
                  <td>
                    <Pill tone={ROLE_TONE[r.name] ?? 'gray'}>{r.name}</Pill>
                  </td>
                  <td>{r.userCount}</td>
                  <td className="text-sm text-muted">{r.access}</td>
                </tr>))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Permission Matrix</h3>
          </div>
          <table className="table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Capability</th>
                <th>Admin</th>
                <th>Analyst</th>
                <th>Reviewer</th>
                <th>R/O</th>
              </tr>
            </thead>
            <tbody>
              {CAPABILITIES.map((cap) => (<tr key={cap.key}>
                  <td>{cap.label}</td>
                  {['Administrator', 'Tax Analyst', 'Reviewer', 'Read-Only'].map((roleName) => {
                const role = roles.find((r) => r.name === roleName);
                return <td key={roleName}>{role?.permissions[cap.key] ? '✓' : '—'}</td>;
            })}
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Users</h3>
          <span className="text-sm text-muted">{users.length} users</span>
        </div>
        <Table columns={userColumns} rows={users} rowKey={(u) => u.id}/>
      </div>
    </AppLayout>);
}

// ======================================================
// END: Users
// ======================================================

// ======================================================
// END: Page Component
// ======================================================

