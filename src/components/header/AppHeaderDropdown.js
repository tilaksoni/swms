import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilUser,
  cilLockLocked,
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import avatar8 from '../../assets/images/avatars/8.jpg'

const AppHeaderDropdown = () => {

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    // clear everything from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("workerId");
    // redirect to login
    window.location.href = "#/login";
  };

 const goToProfile = () => {
  const role = user?.role;
  if (role === "worker") {
    window.location.href = "#/worker-profile";
  } else {
    window.location.href = "#/manager/profile"; // ← update this
  }
};

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>

      <CDropdownMenu className="pt-0" placement="bottom-end">

        {/* Account Header */}
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          {user?.name || "Account"}
        </CDropdownHeader>

        {/* Role Badge */}
        <CDropdownItem disabled>
          <small className="text-medium-emphasis">
            Role: {user?.role || "—"}
          </small>
        </CDropdownItem>

        <CDropdownDivider />

        {/* Profile */}
        <CDropdownItem onClick={goToProfile} style={{ cursor: "pointer" }}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>

   

        {/* Logout */}
        <CDropdownItem
          onClick={handleLogout}
          style={{ cursor: "pointer", color: "#dc3545" }}
        >
          <CIcon icon={cilAccountLogout} className="me-2" />
          Logout
        </CDropdownItem>

      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown