import { useImperativeHandle, useState } from 'react'

const Togglable = (props) => {
  const [loginVisible, setLoginVisible] = useState(false)
  const hideWhenVisible = { display: loginVisible ? 'none' : '' }
  const showWhenVisible = { display: loginVisible ? '' : 'none' }
  const toggleVisibility = () => {
    setLoginVisible(!loginVisible)
  }
  useImperativeHandle(props.ref, () => {
    return {
      toggleVisibility,
    }
  })
  return (
    <div>
      <div style={hideWhenVisible}>
        <button onClick={toggleVisibility}>{props.btnLabel}</button>
      </div>
      <div style={showWhenVisible}>
        {props.children}
        <button onClick={toggleVisibility}>cancel</button>
      </div>
    </div>
  )
}

export default Togglable
