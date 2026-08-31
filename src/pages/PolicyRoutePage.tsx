import { Navigate, useLocation } from "react-router-dom";
import PolicyPage from "../components/PolicyPage";
import { findPolicyByPath } from "../data/policies";

export default function PolicyRoutePage() {
  const location = useLocation();
  const policy = findPolicyByPath(location.pathname);

  if (!policy) {
    return <Navigate to="/governance" replace />;
  }

  return <PolicyPage policy={policy} />;
}
