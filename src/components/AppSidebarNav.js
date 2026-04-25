import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'

export const AppSidebarNav = ({ items }) => {

  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Navigation Link Renderer
  const navLink = (name, icon, badge, indent = false) => {
    return (
      <>
        {icon
          ? icon
          : indent && (
              <span className="nav-icon">
                <span className="nav-icon-bullet"></span>
              </span>
            )}

        {name && name}

        {badge && (
          <CBadge color={badge.color} className="ms-auto" size="sm">
            {badge.text}
          </CBadge>
        )}
      </>
    )
  }

  // Single Navigation Item
  const navItem = (item, index, indent = false) => {
    const { component, name, badge, icon, ...rest } = item
    const Component = component

    return (
      <Component as="div" key={index}>
        {rest.to || rest.href ? (
          <CNavLink
            {...(rest.to && { as: NavLink })}
            {...(rest.href && { target: '_blank', rel: 'noopener noreferrer' })}
            {...rest}
          >
            {navLink(name, icon, badge, indent)}
          </CNavLink>
        ) : (
          navLink(name, icon, badge, indent)
        )}
      </Component>
    )
  }

  // Navigation Group Renderer
  const navGroup = (item, index) => {
    const { component, name, icon, items, ...rest } = item
    const Component = component

    return (
      <Component
        compact
        as="div"
        key={index}
        toggler={navLink(name, icon)}
        {...rest}
      >
        {items?.map((child, idx) =>
          child.items ? navGroup(child, idx) : navItem(child, idx, true)
        )}
      </Component>
    )
  }

  // ⭐ Role Filtering Logic
  return (
    <CSidebarNav as={SimpleBar}>
      {items &&
        items
          .filter(
            (item) =>
              !item.roles ||
              item.roles.includes(user?.role)
          )
          .map((item, index) =>
            item.items ? navGroup(item, index) : navItem(item, index)
          )}
    </CSidebarNav>
  );
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}

export default AppSidebarNav