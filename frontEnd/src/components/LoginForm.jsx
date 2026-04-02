import React from "react";

const LoginForm = (props) => {
  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={props.handleLogin}>
        <div>
          <label>
            username
            <input
              type="text"
              value={props.username}
              onChange={({ target }) => props.setUsername(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            password
            <input
              type="password"
              value={props.password}
              onChange={({ target }) => props.setPassword(target.value)}
            />
          </label>
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default LoginForm;
