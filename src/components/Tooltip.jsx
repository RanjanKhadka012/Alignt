import React from 'react'

export default function Tooltip({ x, y, children }){
  const style = { left: x + 12, top: y + 12 }
  return (
    <div className="tooltip" style={style}>
      {children}
    </div>
  )
}
