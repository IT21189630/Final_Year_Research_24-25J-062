import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const AdminRoute = ({ component: Component, auth: { isAuthenticated, loading, user }, ...rest }) => (
  <Route
    {...rest}
    element={
      loading ? (
        <div>Loading...</div>
      ) : isAuthenticated && user && user.role === 'admin' ? (
        <Component />
      ) : (
        <Navigate to="/login" />
      )
    }
  />
);

AdminRoute.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(AdminRoute);
