import { useContext } from "react";
import { Context } from "../context/AuthContext";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { user } = useContext(Context);
  if(!user){
    return <Navigate to='/' replace/>
  }
  else{
    return children;
  }
};



PrivateRoute.propTypes = {
  children: PropTypes.node,
};

export default PrivateRoute;