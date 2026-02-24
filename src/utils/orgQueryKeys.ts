const defaultQueryKeys = {
  branchList: ["organization", "branches", "list"],
  branch: ["organization", "branch", "detail"],
  departmentList: ["organization", "departments", "list"],
  department: ["organization", "department", "detail"],
  userList: ["organization", "users", "list"],
  user: ["organization", "user", "detail"],
  userDetailForAssignBranches: ["organization", "user", "detail", "assign", "branches"],
  credits: ["organization", "credits"],
  paymentMethodsActive: ["organization", "payment-methods", "active"],
};

export default defaultQueryKeys;