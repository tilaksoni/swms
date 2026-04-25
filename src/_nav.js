import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilUser,
  cilCalendar,
  cilMoney,
  cilPeople,
  cilTask,
  cilVideo
} from '@coreui/icons'


import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [


{
  component: CNavItem,
  name: 'Dashboard',
  to: '/dashboard',
  icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  roles: ['manager']  
},
  {
  component: CNavItem,
  name: 'Worker List',
  to: '/manager/workers',
  icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  roles: ['manager']
},
{
  component: CNavItem,
  name: 'Task Management',
  to: '/manager/tasks',
  icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
  roles: ['manager']
},
{
  component: CNavItem,
  name: 'Attendance',
  to: '/manager/attendance',
  icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  roles: ['manager']
},
{
  component: CNavItem,
  name: 'Salary Management',
  to: '/manager/salary',
  icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
  roles: ['manager']
},
{
  component: CNavItem,
  name: 'My Profile',
  to: '/manager/profile',
  icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  roles: ['manager']
},
  {
  component: CNavItem,
  name: 'My Profile',
  to: '/worker-profile',
  icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  roles: ['worker']
},
{
  component: CNavItem,
  name: 'My Attendance',
  to: '/worker-attendance',
  icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  roles: ['worker']
},
{
  component: CNavItem,
  name: 'My Salary',
  to: '/worker-salary',
  icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
  roles: ['worker']
},
{
  component: CNavItem,
  name: 'Face Register',
  to: '/face-register',
  icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  roles: ['worker']
},
{
  component: CNavItem,
  name: 'Face Attendance',
  to: '/face-attendance',
  icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  roles: ['worker']
},


  {
  component: CNavItem,
  name: 'My Tasks',
  to: '/worker-dashboard',
  icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  roles: ['worker']
},
{
  component: CNavItem,
  name: 'CCTV Monitor',
  to: '/cctv',
  icon: <CIcon icon={cilVideo} customClassName="nav-icon" />,
  roles: ['manager'],   // ← add this
}

]

export default _nav